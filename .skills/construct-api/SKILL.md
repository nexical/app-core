---
name: construct-api
description: Expert guide for building API Modules, defining Endpoints, and following the flexible Endpoint-Service (CRUD) or Endpoint-Action-Service (Business Logic) flow.
---

# construct-api Skill

## Critical Standards

You **MUST** follow the standards defined in:

- `core/ARCHITECTURE.md`: Separation of concerns (Shell vs Registry).
- `core/CODE.md`: Strict Zod validation, no `any`, **Mandatory Import Whitespace**.
- `core/MODULES.md`: Modular API definition, Service Layer, Hooks.
- **Core Neutrality**: The core platform must never know what modules are installed on the system. If the core needs to know information about modules it should implement module loaders or registries.

## Strict Quality Standards

- **Zero Tolerance for `any`**: The use of `any` is strictly prohibited. You MUST use specific types, `unknown` with validation, or proper interfaces. There are NO exceptions to this rule.
- **ESLint Compliance**: All code you generate must be strictly compliant with the project's ESLint rules. Always proactively check for and resolve any linting errors provided in tool feedback.

## 0. Anti-Patterns & Strict Rules

**VIOLATIONS OF THESE RULES WILL CAUSE TEST FAILURES.**

- **GENERATOR FIRST**: Standard API routes, SDKs, and CRUD Services are strictly **GENERATED**.
  - **RULE**: Use `models.yaml` to define standard CRUD roles (List, Get, Create, Update, Delete). Use `api.yaml` ONLY for custom actions or operations that fall outside standard CRUD. Manual creation in `src/pages/api/` is an **"Escape Hatch"** only.
- **MIXED DIRECTORY STRATEGY**: The directories `src/services/` and `src/actions/` are **SHARED** spaces containing both generated and manual files.
  - **CRITICAL**: ALWAYS check for the `// GENERATED CODE` header. **NEVER** edit files containing it.
  - **RULE**: Custom logic MUST be placed in manual kebab-case files (e.g., `auth-service.ts`, `register-auth.ts`).
  - _Note: `{model}-service.ts` (e.g., `user-service.ts`) is reserved for GENERATED CRUD._
- **NO DB ACCESS IN ACTIONS**: Manual Actions (`src/actions`) are the system's orchestrators.
  - **CRITICAL RULE**: Actions MUST NOT access the 'db' (Prisma) directly. They MUST delegate all database operations to Services. Importing ` @/lib/core/db` in an Action is FORBIDDEN.
- **SERVICE-TO-SERVICE PROHIBITION**: Services MUST NOT import other Services directly to avoid circular dependencies and logic leakage.
  - **RULE**: If logic requires multiple services, it MUST be orchestrated by an **Action**.
- **MANDATORY VALIDATION**: All manual Actions MUST define a `static schema` (Zod) and call `this.schema.parse(input)` as the first line of the `run` method.
- **NO LOGIC IN ENDPOINTS**: Endpoints (`src/pages/api`) must **NEVER** contain business logic. They only Validate, Guard, and Call (Action).
- **CENTRALIZED SDK**: Always import types and methods from `@/lib/api`. Use `UserModuleTypes` (or similar) for DTOs and models.

## 1. The API Architecture (YAML-First)

We use a flexible Layered Architecture driven by schemas.

### 1.1 The Source of Truth (YAML)

1.  **`models.yaml`**: Defines data structures, relationships, and standard CRUD access.
2.  **`api.yaml`**: Defines custom API operations (Actions), their paths, and signatures.
3.  **`access.yaml`**: [Optional] Defines declarative Role-Based Access Control (RBAC) rules for the module.

### 1.2 The Workflow

1.  Update the YAML definitions.
2.  **Run `nexical gen api {name}`** to generate Endpoints, SDKs, and CRUD Services.
3.  **Implement custom domain logic** in manual Service or Action files.
4.  **Register components** (Roles, Hooks) in `server-init.ts`.

### 1.3 The Layers

1.  **Endpoint (`src/pages/api/**`)**: [Generated] The HTTP Gateway. Handles Protocol and Security (`ApiGuard`).
2.  **Action (`src/actions/**`)\*\*: [Manual/Mixed] The Entry Point for logic. Orchestrates context, actor verification, and multiple services.
3.  **Service (`src/services/**`)\*\*: [Manual/Mixed] The Domain Authority. Handles Database transactions and Hooks.

## 2. Dual Actor Handling (Users vs Agents)

The system supports both human **Users** and autonomous **Agents**.

- **Context**: The `context.locals.actor` provides the identity.
- **Differentiator**: Check `actor.type === 'user'` or `actor.type === 'agent'` if logic needs to branch (e.g., Agents bypassing certain human-only onboarding checks).
- **Recommendation**: Services should remain agnostic where possible, relying on the Policy layer (`RolePolicy`) to enforce actor-specific restrictions.

## 3. Module Initialization (`server-init.ts`)

API modules must be self-initializing.

- **Dynamic Registration**: Use `import.meta.glob` to automatically register roles and hooks without manual imports in the core.
- **Pattern**:
  ```typescript
  export const init = async () => {
    // Scan and register Roles
    import.meta.glob('./roles/*.ts', { eager: true });
    // Register module-specific hooks
    import.meta.glob('./hooks/*.ts', { eager: true });
  };
  ```

## 4. The Endpoint (STRICTLY GENERATED)

- **Location**: `src/pages/api/**`
- **Rule**: Do not modify generated endpoints.
- **Escape Hatch**: If a custom route is required, create it in `src/pages/api/custom/` using `defineApi`. Manual endpoints MUST call an **Action** for logic execution.

## 5. The Action (`templates/action.ts`)

- **Location**: `src/actions/{kebab-case}-{group}.ts`.
- **Role**: Orchestrator. Validates input, verifies actor context, and calls Services.
- **Prohibition**: **NEVER** import `db` or other Services' internal models.

## 6. The Service Layer

- **Generated CRUD**: Named `{model}-service.ts`.
- **Manual Domain Logic**: Named `{kebab-case}-service.ts`.
- **Standard Signature**: `public static async method(actor: ApiActor, input: T): Promise<ServiceResponse<R>>`.
- **Hook-First Flow**: Filter Input -> DB Operation -> Dispatch Event -> Filter Output.

## 7. Role-Based Access Control (`templates/role.ts`)

- **Location**: `src/roles/{role-name}.ts`.
- **Rule**: Implement `RolePolicy`. Throw error on failure.
- **Declarative Alternative**: Use `access.yaml` for simple role-to-operation mapping.

## 8. Aliased Imports

- **MANDATORY**: Use `@/` for `src/` and `@modules/` for cross-module.
- **WHITESPACE RULE**: A **SINGLE SPACE** is mandatory after the opening quote: `'@/'`.
