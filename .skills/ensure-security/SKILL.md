---
name: ensure-security
description: Expert knowledge of the Security Model, Role-Based Access Control (RBAC), and Attribute-Based Access Control (ABAC).
---

# ensure-security Skill

## Critical Standards

You **MUST** follow the standards defined in:

- `core/ARCHITECTURE.md`: Security Architecture.
- `core/MODULES.md`: Middleware and Guard systems.
- `core/CODE.md`: Service/Action Layer orchestration rules.
- **Core Neutrality**: The core platform must never know what modules are installed on the system. If the core needs to know information about modules it should implement module loaders or registries.

## Strict Quality Standards

- **Zero Tolerance for `any`**: The use of `any` is strictly prohibited. You MUST use specific types, `unknown` with validation, or proper interfaces. There are NO exceptions to this rule.
- **ESLint Compliance**: All code you generate must be strictly compliant with the project's ESLint rules. Always proactively check for and resolve any linting errors provided in tool feedback.

## 1. The Guard System

We do not write ad-hoc `if` statements for security. We use Declarative Guards and standardized API wrappers.

### API Definition & Guard (`src/pages/api/**`)

**Standard**: All API endpoints must be wrapped in `defineApi` and use `ApiGuard.protect`.

- **defineApi**: Provides OpenAPI metadata and standardizes request/response handling.
- **Combined Input Rule**: Inputs from `body`, `query`, and `params` **MUST** be combined into a single object before being passed to `ApiGuard.protect`. This ensures Role Policies have access to all relevant request data for attribute-based checks.

```typescript
import { defineApi } from '@/lib/core/api';
import { ApiGuard } from '@/lib/auth/api-guard';

export const POST = defineApi(
  async (context) => {
    const { body, query, params } = context;
    // MANDATORY: Combine all inputs
    const combinedInput = { ...params, ...query, ...(body as object) };

    // Protect the route using the combined input
    await ApiGuard.protect(context, 'admin', combinedInput);

    // ... implementation
  },
  {
    summary: 'Description of the endpoint',
    tags: ['ModuleTag'],
  },
);
```

### Page Guard (`src/pages/**.astro`)

**Standard**: All protected pages must use `PageGuard`.

```astro
---
import { PageGuard } from '@/lib/ui/page-guard';
// Redirects to login if failing
const { user } = await PageGuard.protect(Astro, { role: 'member' });
---
```

## 2. Service & Action Layer Security

The system uses a strict **Action-Service Orchestration** pattern.

- **Actions**: Gateways and Orchestrators.
  - **Logic**: Actions **MUST NEVER** access the `db` (Prisma) directly. They must delegate ALL data access to Services.
  - **Mixed Directory**: `src/actions/` contains both generated and manual files. Manual files are preserved, but NEVER modify files containing the `// GENERATED CODE` header.
- **Services**: The "System of Record" and Database Gateway.
  - **Authority**: Services are the **ONLY** place allowed to import `db` (from '@/lib/core/db').
  - **Static Pattern**: Use static methods returning `Promise<ServiceResponse<T>>`.
- **Tenancy Enforcement**: MUST be handled in the Service layer using the `actor` or `context` to scope queries.

```typescript
// Good (in Service): Scoping by actor's team
public static async getProject(actor: ApiActor, id: string): Promise<ServiceResponse<Project>> {
  const project = await db.project.findFirst({
    where: { id, teamId: actor.teamId }
  });
  // ... handle response
}
```

## 3. Role Policies & Access Control

### Role Policies (`src/roles/*.ts`)

Complex authorization logic (e.g., ownership checks) must be encapsulated in `RolePolicy` classes.

- **Auto-Discovery**: Roles in `src/roles/` are auto-discovered.
- **Input Parameter**: Receives the `combinedInput` from the API handler.
- **Data Parameter**: Allows for "Post-Fetch" checks (comparing actor ID against fetched record ownership).

### Access Configuration (`access.yaml`)

Use `access.yaml` to define high-level roles and permission mappings for the module.

- **Location**: `apps/backend/modules/{name}/access.yaml`
- **Role Definition**: Define the roles that can be used in `api.yaml` or `ApiGuard.protect`.

## 4. Hooks: Auditing & Data Masking

Security is enforced via side effects (Dispatch) and data modification (Filter).

- **Data Masking (Filter)**: Use `HookSystem.filter` (e.g., `user.read`) to sanitize data before it leaves the module. Use `unknown` + Zod/Type-guards.
- **Auditing (Dispatch)**: Use `HookSystem.on` (e.g., `auth.login_failed`) for non-blocking security logging.
- **Prohibition**: Hooks **MUST NOT** import `db`. Use Services for any required data lookups.

## 5. Security: Enumeration Prevention

Sensitive auth actions (password reset, registration) **MUST NOT** leak whether a user exists.

- **Pattern**: Always return a "Success" message to the client (e.g., "If an account exists, a link has been sent").
- **Internal Logging**: Log the actual result (user not found) internally for debugging, but hide it from the API response.

## 6. Common Vulnerabilities to Watch

- **Direct DB Access**: Bypassing Service logic in Actions, Hooks, or Policies.
- **Input Leakage**: Forgetting to combine `params` and `query` into the guard check.
- **Incomplete Scoping**: Queries in Services that don't check `actor.id` or `actor.teamId`.
- **Bypassing defineApi**: Writing raw Astro API routes without the standard wrapper.
