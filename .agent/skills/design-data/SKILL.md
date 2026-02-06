---
name: design-data
description: Strict governance of the models.yaml (Distributed Schema) and api.yaml. Handles entity relationships, enums, Prisma attribute logic, and API contract definitions.
---

# design-data Skill

## Critical Standards

You **MUST** follow the standards defined in:

- `ARCHITECTURE.md`: Separation of concerns and the "Shell-Registry" pattern.
- `CODE.md`: Coding style, hygiene, and naming conventions.
- `MODULES.md`: Module structure and the authority of the Generator.
- **Core Neutrality**: The core platform must never know what modules are installed on the system. If the core needs to know information about modules it should implement module loaders or registries.

This skill governs the **Data Modeling** and **Contract Definition** phase. The project uses a **Distributed Schema** architecture, where models are defined in YAML and compiled into Prisma, Zod schemas, and TypeScript interfaces.

## 1. The Golden Rule

**NEVER EDIT `prisma/schema.prisma` DIRECTLY.** It is a generated file. All changes must be made in `models.yaml` files.
**NEVER EDIT GENERATED LOGIC.** Files in `src/services/`, `src/actions/`, and `src/sdk/` are managed by the generator and are **IMMUTABLE** by hand.

> **Manual Logic**: Any logic that cannot be generated (complex business rules, external integrations) must be implemented via the **Hook System** in `src/hooks/` or by creating separate manual Service classes that do not overlap with generated ones.

## 2. Source of Truth

- **Core Models**: `prisma/models.yaml` (Base User/Auth models).
- **Module Models**: `modules/<module-name>/models.yaml` (Feature-specific models).
- **API Contracts**: `modules/<module-name>/api.yaml` (The Source of Truth for **Custom Actions** and endpoints).
- **CRUD Contracts**: `modules/<module-name>/models.yaml` (The Source of Truth for **Standard CRUD** endpoints via the `role` configuration).

## 3. Syntax Reference (`models.yaml`)

### Defining a Model (Database Entity)

Models defined here generate Prisma Schema definitions and Zod validation schemas.

```yaml
models:
  ReferralCode:
    fields:
      id:
        type: String
        attributes: [' @id', ' @default(cuid())']
      code:
        type: String
        attributes: [' @unique']
      ownerId:
        type: String
      owner:
        type: User
        attributes: [' @relation(fields: [ownerId], references: [id])']
    attributes:
      - ' @@index([ownerId])'
```

### Defining DTOs and Agent Payloads

Use `db: false` and `api: false` to create Zod schemas and TypeScript interfaces without database tables. This is mandatory for **Agent Job Processor** payloads and virtual models.

```yaml
models:
  SyncProjectJob:
    db: false
    api: false
    fields:
      projectId:
        type: String
        isRequired: true
```

### Storage Provider Pattern

When defining models that handle file references, ensure they integrate with the `StorageProvider` abstraction. Fields should store keys or metadata, while logic interacts with the provider.

- **Location**: ` @/lib/core/storage/`
- **Usage**: Use `getStorageProvider()` to handle files in a cloud-agnostic way.

## 4. Custom API Actions: `api.yaml`

`api.yaml` is used for **Custom Actions** and operations that fall outside standard CRUD. Defining an endpoint here automatically triggers the generation of the logic layer (API Handler, Action, and SDK method).

### Standard CRUD vs Custom Actions:

- **Standard CRUD**: Defined in `models.yaml` using the `role` block. Includes List, Get, Create, Update, and Delete.
- **Custom Actions**: Defined in `api.yaml`. Includes specialized logic like authentication flows, bulk operations, or third-party integrations.

### Mapping Rules:

- **verb**: HTTP method (`GET`, `POST`, `PATCH`, `DELETE`).
- **method**: The logical name of the generated SDK method (e.g., `validateReferral`).
- **role**: Defines the required permission level. Use **lowercase** (e.g., `member`, `admin`).
- **input**: The DTO model defined in `models.yaml`.
- **action** (Optional): Explicitly defines the filename in `src/actions/`.
  - If provided: `action: sync-project` -> `sync-project.ts`.
  - If omitted: Falls back to `{method}-{group}` in kebab-case.

### Action Implementation Requirements:

Manual Action classes MUST implement:
`public static async run(input: T, context: APIContext): Promise<ServiceResponse<any>>`

- **Context**: Use `context.locals.actor` for authorization and data scoping.
- **Imports**: `import type { APIContext } from 'astro';` (Astro context) or `import type { APIContext } from ' @/types/api';` if a local wrapper exists.

```yaml
# modules/my-module/api.yaml
Referral:
  - path: /validate
    verb: POST
    method: validateReferral
    role: member
    summary: Checks if a referral code is valid
    action: validate-referral
    input: ValidateReferralDTO
    response: ServiceResponse<ReferralCode>
```

## 5. Consumption & Usage

### Importing Models & Types

Always use strict Named Aliases. A **SINGLE SPACE** is required after the opening quote for internal aliases and workspace packages.

- **Database Models**: Import from `' @prisma/client'`.

  ```typescript
  import { ReferralCode, ReferralStatus } from ' @prisma/client';
  ```

- **DTOs & Types**: Import module-specific generated types from the module's SDK types.

  ```typescript
  import { ValidateReferralDTO } from ' @modules/my-module/src/sdk/types';
  ```

- **Core Types**: Common interfaces like `ServiceResponse` are imported from the service-specific type file.
  ```typescript
  import type { ServiceResponse } from ' @/types/service';
  ```

## 6. Manual Logic Layer (Services & Hooks)

### Static Service Pattern

Manual services contain domain logic and database transactions.

- **Location**: `src/services/`
- **Rule**: Methods MUST be `public static async`.
- **Rule**: MUST return `Promise<ServiceResponse<T>>`.
- **Rule**: MUST use `db` from `' @/lib/core/db'` for transactions.

### Hook-Driven Extensibility

Since Services and Actions are generated, you must use the **Hook System** for custom business logic.

- **Registration**: Hooks are **automatically registered** if placed in `src/hooks/`. Do NOT edit `server-init.ts`.
- **Data Transformation (Filters)**:
  - `HookSystem.filter('project.beforeCreate', async (data) => { ... return data; })`
- **Side-Effects (Events)**:
  - `HookSystem.on('project.created', async (result) => { ... })`

## 7. Agentic Design (Autonomous Actors)

When designing for agents, you must strictly follow the Job Processor pattern.

### Job Processor Pattern

1.  **Source of Truth**: Define the payload in `models.yaml` with `db: false, api: false`.
2.  **Implementation**: Extend `JobProcessor<T>` from `' @nexical/agent/src/core/processor.js'`.
3.  **Signature**:
    ```typescript
    public async process(job: AgentJob<T>, context: AgentContext): Promise<AgentResult | void>
    ```
4.  **Strict Rule**: Agents are **FORBIDDEN** from importing `' @/lib/core/db'`. They must use manual Services or the Federated SDK.

### Persistent Agent Pattern

Background workers extending `PersistentAgent` from `' @nexical/agent/src/core/persistent.js'` and implementing `tick()`. They must also adhere to the "No DB" rule.

## 8. Next Steps (Generator Protocol)

After designing the data in YAML:

1.  **Generate Artifacts**: Use the Arc CLI to scaffold/update the logic layer.

    ```bash
    nexical gen api <module-name>
    ```

    > **CRITICAL WARNING**: DO NOT edit files in `src/services`, `src/actions`, or `src/sdk` that have the `// GENERATED CODE` header.

2.  **Manual Logic**: Implement custom logic via **Hooks** in `src/hooks/` or manual services.
