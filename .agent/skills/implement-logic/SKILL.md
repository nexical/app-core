---
name: implement-logic
description: Expert knowledge of the Service Layer, Business Logic, and Hook System. Enforces the Static Service pattern, Action pattern, Job Processors, and Providers.
---

# implement-logic Skill

## Critical Standards

You **MUST** follow the standards defined in:

- `ARCHITECTURE.md`: Shell-Registry, Service Layer, Agents.
- `MODULES.md`: Modular Monolith, Hooks, API/SDK Flow.
- `CODE.md`: Strict Types, Zod Validation, Error Handling.
- **Core Neutrality**: The core platform must never know what modules are installed on the system. If the core needs to know information about modules it should implement module loaders or registries.

## 1. The Service Pattern

Services are the **System of Record** authority for data access and CRUD operations. They encapsulate Prisma logic and emit hooks.

### Rules & Structure

- **File Naming**: Manual domain services MUST use `{kebab-case}-ops-service.ts`. Generated CRUD services use `{model}-service.ts`.
- **Class**: Must be a **Static Class**. Do not instantiate services.
- **Database Access**: Services are the **ONLY** layer allowed to import `db` from `@/lib/core/db`.
- **Actor Context**: All public domain methods **MUST** accept an `actor?: ApiActor` parameter to enable security scoping and authorship tracking.
- **Return Type**: **ALL** public methods MUST return a `ServiceResponse<T>` object (e.g., `{ success: true, data }`).
- **Error Handling**: Wrap logic in `try/catch`. Catch errors, log them using `Logger`, and return `{ success: false, error: 'translation.key' }`.
- **Transactions**: Use `db.$transaction` for mutations to ensure atomicity.

### The "Hook-First" Logic Flow

Manual services MUST follow this flow for consistency with generated ones:

1.  **Filter (Pre-Hook)**: `HookSystem.filter('{entity}.before{Action}', ...)` to allow input modification or validation.
2.  **Execute (Transaction)**: Perform the core logic/DB operation.
3.  **Dispatch (Post-Hook)**: `HookSystem.dispatch('{entity}.{action}Performed', ...)` for side effects.
4.  **Filter (Read-Hook)**: `HookSystem.filter('{entity}.read', ...)` to decorate the return value.

## 2. The Action Pattern

Actions encapsulate single-purpose operations that orchestrate multiple services. They act as the bridge between API Handlers and the Service Layer.

- **File Naming**: Must use the naming convention `{kebab-case}-{group}.ts` (e.g., `sync-project.ts`).
- **Structure**: Class with a static `run(input, context: APIContext)` method.
- **Context**: Use `APIContext` from `astro`. Extract the `actor` from `context.locals.actor`.
- **Authorization**: Actions MUST check for the presence of an `actor` and perform basic permission checks before executing logic.
- **Typing**: Input and Output MUST be strictly typed using DTOs from the SDK. **The use of `any` is strictly FORBIDDEN.**
- **Orchestration**: Actions MUST orchestrate multiple Service calls or implement non-CRUD business rules. They must **NEVER** import `db` directly.
- **Enumeration Prevention**: Sensitive actions (auth, user lookup) MUST return consistent "Success" responses to avoid leaking user existence.
- **Return**: Returns `Promise<ServiceResponse<T>>`.

## 3. Background Agents (src/agent/)

All background logic must reside in the `src/agent/` directory.

### Job Processors

For discrete, asynchronous tasks queued by the system.

- **Base Class**: Extend `JobProcessor<T>`.
- **Requirements**: Define `jobType` and `schema` (Zod).
- **Payload Source of Truth**: Payloads **MUST** be defined in `models.yaml` (db: false, api: false) and imported from the module SDK. Inline schemas are **FORBIDDEN**.
- **Logic**: Must delegate logic to Services or Utilities and handle `ServiceResponse`.
- **Error Handling**: Throw on failure to trigger system retries.

### Persistent Agents

For long-running workers that run on an interval.

- **Base Class**: Extend `PersistentAgent`.
- **Requirements**: Implement `tick()` method.
- **Data Access**: Must use `this.api` (Federated SDK) or Services; never direct DB imports.

## 4. Hook Registration

Side effects and data modifications are implemented by creating listener files in `src/hooks/`.

- **Location**: `modules/{name}/src/hooks/{kebab-case}-hooks.ts`.
- **Structure**: Class with a `static init()` method.
- **Discovery**: The module's generated `server-init.ts` automatically discovers and calls `init()` for all files in `src/hooks/`. **Manual registration in server-init.ts is FORBIDDEN.**
- **Rules**: Use `HookSystem.on` for side effects and `HookSystem.filter` for data modification. NEVER import `db` in a hook.

## 5. Storage Provider Abstraction

Infrastructure abstraction for file storage, allowing swappable drivers.

- **Structure**: Define an interface in `src/lib/core/storage/interface.ts` and implementations in separate files (e.g., `local.ts`).
- **Access**: Always via `getStorageProvider()` factory.
- **Pattern**: Decouple business logic from storage backends.

## 6. Templates

- `templates/service.ts`: `{kebab-case}-ops-service.ts` (Manual domain logic).
- `templates/action.ts`: `{kebab-case}-{group}.ts` (Orchestration).
- `templates/hook.ts`: Hook registration class (Auto-discovered).
- `templates/job.ts`: Background job processor (SDK-integrated).
- `templates/persistent-agent.ts`: Long-running worker.
- `templates/storage-provider.ts`: Infrastructure abstraction.
