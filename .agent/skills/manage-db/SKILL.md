---
name: manage-db
description: Expert usage of the Database Compiler. Handles the additive Schema Ontology (models.yaml) and the Generated Prisma Client.
---

# manage-db Skill

## Critical Standards

You **MUST** follow the standards defined in:

- `ARCHITECTURE.md`: 3-Tier Modular Monolith Architecture.
- `MODULES.md`: Additive Schema Design & Mixed Directories.
- `CODE.md`: Service Layer Patterns.
- **Core Neutrality**: The core platform must never know what modules are installed on the system. If the core needs to know information about modules it should implement module loaders or registries.

### 🔴 STRICT PROHIBITIONS

1.  **NO Direct DB Access in API/Actions**: You must **NEVER** import or use `prisma` or `db` directly inside `modules/{name}/src/pages/api/` or `modules/{name}/src/actions/`.
2.  **NO Direct DB Access in Agents**: JobProcessors and PersistentAgents **MUST NOT** import `db`. They must use Services or the Federated SDK.
3.  **NO Direct DB Access in Middleware/Core**: Even core files (e.g., `src/middleware.ts`) should delegate data operations to Services. If you find `db` imports outside of `modules/{name}/src/services/`, they are architectural debt. **NEVER** add `import { db }` to middleware.
4.  **Service Layer Mandatory**: All database logic must be encapsulated in a static `Service` class located in `modules/{name}/src/services/`.
5.  **Transactions Required**: All mutations (create, update, delete) must be wrapped in `db.$transaction`.
6.  **Static Only**: All Service and Action methods must be `static`.

## 1. The Schema Ontology (`models.yaml`)

We DO NOT edit `schema.prisma` directly.

- **Source of Truth**: `modules/{name}/models.yaml`.
- **Compilation**: The compiler merges these fragments into `prisma/schema.prisma`.

### Workflow

1.  **Edit**: Modify `modules/{name}/models.yaml`.
2.  **Generate**: Run `nexical` or `npx tsx scripts/generate-prisma.ts`.
3.  **Push/Migrate**:
    - **Dev**: `npm run db:push`
    - **Prod**: `npm run db:migrate`

## 2. Runtime Data Access (The 3-Tier Pattern)

Access to data follows a strict hierarchy: `Action -> Service -> DB`.

### Tier 1: Actions (`modules/{name}/src/actions/`)

Actions handle validation and orchestrate business logic across multiple services.

- **Location**: `modules/{name}/src/actions/{kebab-case}.ts` (Manual)
- **Naming Convention**: Always use `{kebab-case}.ts`. Do not add group suffixes like `-ops.ts`.
- **Signature**: MUST implement `public static async run(input: unknown, context: APIContext)`.
- **Validation**: Manual Actions **MUST** define a `static schema` (Zod) and perform `this.schema.parse(input)` inside `.run()`. This is non-negotiable for security and decoupling.
- **Authorization**: **MANDATORY**: Retrieve the current actor from `context.locals.actor`. If the actor is missing, return an error (e.g., 401 Unauthorized). NEVER skip actor verification in actions.
- **Prohibition**: **NEVER** import `db` here.
- **Template**: `templates/action.ts`

### Tier 2: Services (`modules/{name}/src/services/`)

Services are the **ONLY** tier allowed to import `db` from `@/lib/core/db`.

- **Mixed Directory**: `modules/{name}/src/services/` contains both machine-generated and manual code.
  - **CRITICAL**: Check for `// GENERATED CODE` headers. Do **NOT** modify these files.
  - **Custom Logic**: Create manual files with `{kebab-case}-ops-service.ts` suffixes.
- **Requirement**: Must be stateless classes with static methods.
- **Signature**: Methods **MUST** be `public static async`, accept an `actor: ApiActor` parameter (even for read-only ops if they trigger hooks), and return `Promise<ServiceResponse<T>>`.
- **Logic Flow**: **MANDATORY**: Follow the sequence: **Filter Input -> Execute Logic -> Dispatch Side-Effects -> Filter Output**.
  - Use `HookSystem.filter` for Input/Output.
  - Use `HookSystem.dispatch` for side effects.
- **Template**: `templates/service.ts`

## 3. Storage Abstraction

File operations related to database records (e.g., attachments, avatars, generated artifacts) must use the Storage Provider.

- **Pattern**: Use `getStorageProvider()` factory from `@/lib/core/storage`.
- **Rule**: Do not hardcode filesystem or S3 paths outside of provider implementations.
- **Usage**: Usually invoked within a Service or an Agent. In Services, it often happens before or after the DB transaction.

## 4. Hook Integration & Lifecycle

Data mutations must trigger lifecycle events via the `HookSystem`.

1.  **Filter Input**: Use `HookSystem.filter('model.beforeCreate', ...)` before database operations.
2.  **Execute Logic**: Perform the DB operation (usually inside a transaction).
3.  **Dispatch Event**: Use `HookSystem.dispatch('model.created', ...)` after successful mutations.
4.  **Filter Output**: Use `HookSystem.filter('model.afterCreate', ...)` to sanitize or transform data before returning to the caller.
5.  **Registration**: All hooks MUST be registered in the module's `modules/{name}/src/server-init.ts` file via the `static init()` method (handled by the generator).

## 5. Agentic Interaction

Agents (JobProcessors) in `modules/{name}/src/agent/` must follow strict isolation.

- **Base Class**: Extend `JobProcessor<T>` from `@nexical/agent`.
- **Configuration**: MUST define a `public static jobType: string`. It is NOT an instance property.
- **Validation**: MUST define a `public schema` (Zod) to validate job data.
- **Payload Access**: **CRITICAL**: Use `job.payload` to access the validated data (do not use `.data`).
- **Data Access**: MUST use Services or the Federated SDK (`context.api`). **NEVER** import `db` in an agent.
- **Template**: `templates/agent-processor.ts`

## 6. Architectural Guardrails (Manual Linting)

Before finalizing any DB-related change, perform these checks:

1.  **Grep for DB Imports**: Run `grep -r "import { db } from '@/lib/core/db'"` and ensure it ONLY matches files in `modules/*/src/services/`.
2.  **Check for Schema in Actions**: Ensure any manual `.ts` file in `modules/*/src/actions/` defines a `static schema` and calls `.parse()`.
3.  **Check for Actor in Services**: Ensure every manual service method accepts `actor: ApiActor`.
4.  **Check for Hook Flow**: Ensure manual services implement all 4 steps: Filter Input, Execute, Dispatch, Filter Output.
5.  **Generated Header Check**: Ensure no file containing `// GENERATED CODE` has been modified manually.
