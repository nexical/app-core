---
name: construct-api
description: Expert guide for building API Modules, defining Endpoints, and following the flexible Endpoint-Service (CRUD) or Endpoint-Action-Service (Business Logic) flow.
---

# construct-api Skill

## Critical Standards

You **MUST** follow the standards defined in:

- `ARCHITECTURE.md`: Separation of concerns (Shell vs Registry).
- `CODE.md`: Strict Zod validation, no `any`.
- `MODULES.md`: Modular API definition, Service Layer, Hooks.
- **Core Neutrality**: The core platform must never know what modules are installed on the system. If the core needs to know information about modules it should implement module loaders or registries.

## 0. Anti-Patterns & Strict Rules

**VIOLATIONS OF THESE RULES WILL CAUSE TEST FAILURES.**

- **GENERATOR FIRST**: Standard API routes, SDKs, and CRUD Services are strictly **GENERATED**.
  - **RULE**: Use `models.yaml` to define standard CRUD roles (List, Get, Create, Update, Delete). Use `api.yaml` ONLY for custom actions or operations that fall outside standard CRUD. Manual creation in `src/pages/api/` is an **"Escape Hatch"** only.
- **MIXED DIRECTORY STRATEGY**: The directories `src/services/` and `src/actions/` are **SHARED** spaces containing both generated and manual files.
  - **CRITICAL**: ALWAYS check for the `// GENERATED CODE` header. **NEVER** edit files containing it.
  - **RULE**: Custom logic MUST be placed in manual kebab-case files (e.g., `auth-service.ts`, `register-auth.ts`).
  - _Note: `{model}-service.ts` (e.g., `user-service.ts`) is reserved for GENERATED CRUD._
- **ORCHESTRATION IN ACTIONS**: Actions (`src/actions`) are the system's orchestrators.
  - **RULE**: Prefer delegating DB access to Services, but direct `db` access is **PERMITTED** for orchestration or complex transactions.
- **NO LOGIC IN ENDPOINTS**: Endpoints (`src/pages/api`) must **NEVER** contain business logic. They only Validate, Guard, and Call (Service/Action).

## 1. The API Architecture (Generator First)

We use a flexible Layered Architecture driven by schemas.

### 1.1 The Workflow

1.  **Update `models.yaml`** to define data structures and standard CRUD roles.
2.  **Update `api.yaml`** to define custom API operations (actions).
3.  **Run `nexical gen api {name}`** to generate Endpoints, SDKs, and CRUD Services.
4.  **Implement custom domain logic** in manual Service or Action files.

### 1.2 The Layers

1.  **Endpoint (`src/pages/api/**`)**: [Generated] The HTTP Gateway. Handles Protocol, Security (`ApiGuard`), and Input Validation.
2.  **Action (`src/actions/**`)\*\*: [Manual/Mixed] The Controller for complex business logic. Orchestrates multiple services.
3.  **Service (`src/services/**`)**: [Manual/Mixed] The Domain Logic. Handles Database and Hooks. MUST use **Static Methods\*\*.

## 2. The Endpoint (STRICTLY GENERATED)

- **Location**: `src/pages/api/**`
- **Rule**: Do not modify generated endpoints.
- **Escape Hatch**: If a custom route is required that `api.yaml` cannot describe, create it in `src/pages/api/custom/` using `defineApi`.
- **Pattern**: Manual endpoints MUST merge `params`, `query`, and `body` into a `combinedInput` before calling `ApiGuard.protect`.

## 3. The Action (`templates/action.ts`)

- **Location**: `src/actions/{kebab-case}-{group}.ts` (e.g., `register-auth.ts`).
- **Signature**: `public static async run(input: T, context: APIContext): Promise<ServiceResponse<R>>`.
- **Role**: Orchestration of workflows. Direct `db` access is allowed for orchestration.
- **Types**: Import DTO types from the generated SDK (`../sdk/types`).

## 4. The Service Layer

- **Generated CRUD**: Named `{model}-service.ts` (e.g., `user-service.ts`). Contains standard Prisma operations.
  - **Hybrid Generation**: The `ServiceBuilder` preserves, but does not overwrite, existing manual methods found in the class. You MAY add custom static methods to this file if they are tightly coupled to the entity, but prefer a separate service if logic is complex.
- **Manual Domain Logic**: Named `{kebab-case}-service.ts` (e.g., `profile-service.ts`).
- **Note**: All public methods MUST be `static` and return `Promise<ServiceResponse<T>>` (from `@/types/service`).

## 5. Role-Based Access Control (`templates/role.ts`)

- **Location**: `src/roles/{role-name}.ts` (kebab-case).
- **Rule**: All role classes **MUST** implement the `RolePolicy` interface.
- **Signature**: `async check(context: APIContext | AstroGlobal, input: any, resource?: any): Promise<void>`. (Throws if denied).
- **Actor Access**: Use `const actor = context.locals?.actor;`.

## 6. Hook System Integration

- **Location**: `src/hooks/{kebab-case}-hooks.ts`.
- **Rule**: Hooks MUST be registered in a static `init` method using `HookSystem.on` or `HookSystem.filter`.

## 7. Aliased Imports

- **REQUIRED**: Use `@/` for `src/` (Core/Internal).
- **REQUIRED**: Use `@modules/` for cross-module imports.
