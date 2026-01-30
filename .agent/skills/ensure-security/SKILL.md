---
name: ensure-security
description: Expert knowledge of the Security Model, Role-Based Access Control (RBAC), and Attribute-Based Access Control (ABAC).
---

# ensure-security Skill

## Critical Standards

You **MUST** follow the standards defined in:

- `ARCHITECTURE.md`: Security Architecture.
- `MODULES.md`: Middleware and Guard systems.
- `CODE.md`: Service/Action Layer orchestration rules.
- **Core Neutrality**: The core platform must never know what modules are installed on the system. If the core needs to know information about modules it should implement module loaders or registries.

## 1. The Guard System

We do not write ad-hoc `if` statements for security. We use Declarative Guards.

### API Guard (`src/pages/api/**`)

**Standard**: All API endpoints must use `ApiGuard.protect`. These routes are **STRICTLY GENERATED** from `api.yaml`.

- **Definition**: Ensure your `api.yaml` definition includes the appropriate `role` and `guard` configurations. The generator will handle the `ApiGuard` call.
- **Verification**: If a route bypasses security, verify the `api.yaml` configuration rather than editing the generated file.

### Page Guard (`src/pages/**.astro`)

**Standard**: All protected pages must use `PageGuard`.

```astro
---
import { PageGuard } from '@/lib/auth/page-guard';
// Redirects to login if failing
const { user } = await PageGuard.protect(Astro, { role: 'member' });
---
```

## 2. Service & Action Layer Security

The system uses **Action-Service Orchestration**.

- **Actions**: Coordinate business logic and multiple Service calls.
  - **Naming**: MUST follow the `{kebab-action}-{group}.ts` convention (e.g., `reset-password-auth.ts`). The `{group}` suffix is required for organization and to distinguish from generated CRUD.
  - **Logic**: Actions **MUST NEVER** access the `db` (Prisma) directly. They must delegate ALL data access to Services. This is non-negotiable for security and auditability.
  - **Signature**: `public static async run(input: T, context: APIContext): Promise<U>`
- **Services**: The "System of Record".
  - **Authority**: Services are the **ONLY** place allowed to import `db` (from '@/lib/core/db').
  - **Returns**: Domain methods MUST return `Promise<ServiceResponse<T>>`.
- **Tenancy Enforcement**: MUST be handled in the Service layer. Services should accept an `actor` or `context` to scope queries.
  - _Bad (in Action)_: `const project = await db.project.findUnique(...)`
  - _Good (in Service)_: `const project = await this.db.project.findFirst({ where: { id, teamId: actor.teamId } })`

## 3. Role Policies (`modules/{name}/src/roles/*.ts`)

Complex authorization logic belongs in `RolePolicy` classes.

**CRITICAL: Auto-Discovery**: Roles are **auto-discovered** from the `src/roles/` directory. **DO NOT** manually edit `server-init.ts`. The generated code handles registration.

**Interface Protocol**:

- **Path**: `import { RolePolicy } from '@/lib/registries/role-registry';`
- **Method**: `async check(context: APIContext | AstroGlobal, input: T, data?: unknown): Promise<void>`
- **Data Parameter**: The `data` parameter allows for "Post-Fetch" checks (e.g., checking if the `actor.id` matches the `ownerId` of the record fetched by the API handler).
- **Failure**: You **MUST** throw an `Error` (or subclass) if authorization fails.
- **DB Access**: Policies **MUST NOT** import `db`. They should call Service methods and handle the `ServiceResponse`.

```typescript
// modules/project-api/src/roles/project-admin.ts
import { RolePolicy } from '@/lib/registries/role-registry';
import type { APIContext, AstroGlobal } from 'astro';
import { ProjectService } from '../services/project-service';

export class ProjectAdminPolicy implements RolePolicy<{ projectId: string }> {
  async check(context: APIContext | AstroGlobal, input: { projectId: string }, data?: unknown) {
    const actor = context.locals?.actor;
    if (!actor) throw new Error('Unauthorized');

    // 1. Post-fetch ownership check
    if (data && typeof data === 'object') {
      const project = data as Record<string, unknown>;
      // Adjust field name (e.g., userId, ownerId) based on your model
      if (project.ownerId === actor.id) return;
    }

    // 2. Call service and handle ServiceResponse
    const response = await ProjectService.verifyAdmin(actor.id, input.projectId);

    if (!response.success) {
      throw new Error(response.error?.message || 'User is not an admin of this project');
    }
  }
}
```

## 4. Hooks: Auditing & Data Masking

Security is enforced via side effects (Dispatch) and data modification (Filter).

**CRITICAL: Auto-Discovery**: Hooks in `src/hooks/` are **auto-discovered**. **DO NOT** manually edit `server-init.ts`.

**CRITICAL: No Direct DB**: Hooks **MUST NOT** import `db`. Use Services or the SDK for data operations.

**CRITICAL: Config Layer**: Hooks **MUST NOT** use `process.env` directly. Use the module's configuration system.

### Data Masking (Filter)

Use `HookSystem.filter` to sanitize sensitive data. Use `unknown` and validate/cast instead of `any`.

```typescript
// modules/user-api/src/hooks/security-filters.ts
import { HookSystem } from '@/lib/modules/hooks';

export class SecurityFilters {
  static init() {
    HookSystem.filter('user.read', async (data: unknown) => {
      if (!data || typeof data !== 'object') return data;

      const user = data as Record<string, unknown>;
      const { passwordHash, ssn, ...publicUser } = user;
      return publicUser;
    });
  }
}
```

### Auditing (Dispatch)

Use `HookSystem.on` for security event logging.

```typescript
// modules/user-api/src/hooks/audit-hooks.ts
import { HookSystem } from '@/lib/modules/hooks';
import { Logger } from '@/lib/core/logger';

export class AuditHooks {
  static init() {
    HookSystem.on('auth.login_failed', async (event: { email: string }) => {
      Logger.warn(`Security Alert: Failed login for ${event.email}`);
    });
  }
}
```

## 5. Security: Enumeration Prevention

Sensitive auth actions (password reset, registration, account recovery) **MUST NOT** leak whether a user exists in the system.

- **Pattern**: Always return a "Success" message to the client, even if the lookup failed.
- **Implementation**: In the Action, if a user is not found, log it internally (to `Logger`) but return `ServiceResponse.success()` to the caller.

```typescript
// Example Implementation in an Action
if (!user) {
  Logger.info(`Password reset requested for non-existent user: ${input.email}`);
  return ServiceResponse.success({ message: 'If an account exists, a reset link has been sent.' });
}
```

## 6. Modular Configuration Security

Environment variables must be validated via `createConfig` (or equivalent module config pattern) and Zod.

- **Standard**: **NEVER** use `process.env` directly in Actions, Services, or Hooks. Use the module's config object.
- **Secrets**: Use the configuration layer to centralize and validate sensitive keys.

## 7. Common Vulnerabilities to Watch

- **Direct DB Access**: Bypassing the Service layer logic in Actions, Hooks, or Policies.
- **Manual process.env Usage**: Bypassing validation in side-effect files (like hooks). Use module config.
- **api.yaml Misconfiguration**: Forgetting to define a `role` or `guard`.
- **Leaking DTOs**: Returning raw Prisma models instead of filtered objects.
- **Incomplete "Myself" Checks**: Only checking the ID in the input without verifying ownership of the actual data in the DB (use the `data` parameter in `check`).
