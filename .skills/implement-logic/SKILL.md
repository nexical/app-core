---
name: implement-logic
description: Expert knowledge of the Service Layer, Business Logic, and Hook System. Enforces the Static Service pattern, Action pattern, Job Processors, and Providers.
---

# implement-logic Skill

## Critical Standards

You **MUST** follow the standards defined in:

- `core/ARCHITECTURE.md`: Shell-Registry, Service Layer, Agents.
- `core/MODULES.md`: Modular Monolith, Hooks, API/SDK Flow.
- `core/CODE.md`: Strict Types, Zod Validation, Error Handling.
- **Core Neutrality**: The core platform must never know what modules are installed on the system.

## Strict Quality Standards

- **Zero Tolerance for `any`**: The use of `any` is strictly prohibited. You MUST use specific types, `unknown` with validation, or proper interfaces. There are NO exceptions to this rule.
- **ESLint Compliance**: All code you generate must be strictly compliant with the project's ESLint rules. Always proactively check for and resolve any linting errors provided in tool feedback.

## 1. Universal Database Access

While Services remain the primary "System of Record" for shared business logic, the Nexical Ecosystem permits **Universal Database Access**.

- **Rule**: Import `db` from `@/lib/core/db` for all database operations across all backend layers (**Services and Hooks**).
- **Restriction**: **NEVER** use `db` directly inside an Action. Actions must delegate to Services.
- **Usage**: `import { db } from '@/lib/core/db';`

## 2. The Service Pattern (Business Logic)

Services encapsulate complex domain logic, Prisma transactions, and emit hooks. They are the "Engines" of the system.

- **File Naming**: Manual domain services MUST use `{kebab-case}-service.ts`.
- **Class**: Must be a **Static Class**. Do not instantiate services.
- **Actor Context**: All public domain methods **MUST** accept an `actor?: ApiActor` parameter to enable security scoping and authorship tracking.
- **Return Type**: **ALL** public methods MUST return a `ServiceResponse<T>` object to ensure consistent error handling.
- **Hook-First Flow**:
  1. **Filter (Pre)**: `HookSystem.filter('{entity}.before{Action}', ...)`
  2. **Execute**: Perform logic/DB operation.
  3. **Dispatch (Post)**: `HookSystem.dispatch('{entity}.{action}Performed', ...)`
  4. **Filter (Read)**: `HookSystem.filter('{entity}.read', ...)`

## 3. The Action Pattern (API Gateways)

Actions are single-purpose gateways triggered by API endpoints. They handle actor extraction and service delegation.

- **Generation Protocol**: **NEVER** create Action files manually. Define the operation in `api.yaml` and run `nexical gen api {module}`.
- **Location**: `src/actions/`.
- **Logic Policy**: **Gateways, not Engines**. Actions MUST NOT contain complex business logic or direct Prisma calls. They delegate to a `Service`.
- **Authorization**: Use `ApiGuard.protect` or `RolePolicy` classes to enforce security. Manual actor checks should be minimized in favor of policy-driven enforcement.
- **I18n**: Subject lines and user-facing strings MUST be fetched using `getTranslation()`.
- **CentralIZED SDK**: All SDK access (methods, types) MUST be via `@/lib/api`. Use `*ModuleTypes` for types.

## 4. Role-Based Policy Enforcement

Security policies are isolated in `src/roles/` to maintain clean separation between logic and access control.

- **Rule**: Access control logic MUST be encapsulated in `RolePolicy` classes.
- **Usage**: Policies are invoked via `ApiGuard.protect` in route handlers or checked within Actions for fine-grained control.
- **Naming**: `{role-name}.ts` (e.g., `job-owner.ts`).

## 5. Hook Registration & Auto-Discovery

Cross-module side-effects and data transformations are isolated in Hook classes.

- **Location**: `src/hooks/*-hooks.ts`.
- **Auto-Discovery Rule**: Every hook file **MUST** export an `init` function that calls the class's static `init` method.
- **Registration**: Use `HookSystem.on` for side effects and `HookSystem.filter` for data transformations.

## 6. Provider & Storage Patterns

For external integrations or polymorphic logic, use the Provider pattern.

- **Location**: `src/lib/core/storage/` or `src/providers/`.
- **Structure**: Define an interface, provide concrete implementations, and use a Factory/Singleton getter.

## 7. Background Agents & Jobs

- **Job Processors**: Discrete tasks queued via `JobProcessor<T>`. Payloads MUST be defined in `models.yaml`.
- **Persistent Agents**: Long-running workers extending `PersistentAgent`.

## 8. Templates

- `templates/service.ts`: `{kebab-case}-service.ts` (Manual domain logic).
- `templates/action.ts`: Gateway implementation for generated Actions.
- `templates/role.ts`: RolePolicy class for security enforcement.
- `templates/hook.ts`: Hook registration class.
- `templates/job.ts`: Background job processor.
- `templates/persistent-agent.ts`: Long-running worker.
- `templates/provider.ts`: Generic provider factory.
- `templates/storage-provider.ts`: Specialized storage driver.
