---
name: design-data
description: Strict governance of the models.yaml (Distributed Schema) and api.yaml. Handles entity relationships, enums, Prisma attribute logic, and API contract definitions.
---

# design-data Skill

## Critical Standards

You **MUST** follow the standards defined in:

- `core/ARCHITECTURE.md`: Separation of concerns and the "Shell-Registry" pattern.
- `core/CODE.md`: Coding style, hygiene, and naming conventions.
- `core/MODULES.md`: Module structure and the authority of the Generator.
- **Core Neutrality**: The core platform must never know what modules are installed on the system. If the core needs to know information about modules it should implement module loaders or registries.

## Strict Quality Standards

- **Zero Tolerance for `any`**: The use of `any` is strictly prohibited. You MUST use specific types, `unknown` with validation, or proper interfaces. There are NO exceptions to this rule.
- **ESLint Compliance**: All code you generate must be strictly compliant with the project's ESLint rules. Always proactively check for and resolve any linting errors provided in tool feedback.

This skill governs the **Data Modeling** and **Contract Definition** phase. The project uses a **Distributed Schema** architecture, where models are defined in YAML and compiled into Prisma, Zod schemas, and TypeScript interfaces.

## 1. The Golden Rule

**NEVER EDIT `prisma/schema.prisma` DIRECTLY.** It is a generated file. All changes must be made in `models.yaml` files.

**GENERATED VS MANUAL LOGIC**:

- **GENERATED FILES**: Files in `src/pages/api/` and `src/sdk/` are strictly managed by the generator and are **IMMUTABLE** by hand.
- **MIXED DIRECTORIES**: `src/services/` and `src/actions/` are mixed. Specific files with the `// GENERATED CODE` header are immutable, but you are **ENCOURAGED** to add manual files for domain logic within these directories.
- **MANUAL LOGIC**: Any logic that cannot be generated (complex business rules, external integrations) should be implemented via the **Hook System** in `src/hooks/` or by creating manual Service classes.

## 2. Source of Truth

- **Core Models**: `core/prisma/models.yaml` (Base User/Auth models).
- **Module Models**: `apps/backend/modules/<module-name>/models.yaml` (Feature-specific models).
- **API Contracts**: `apps/backend/modules/<module-name>/api.yaml` (The Source of Truth for **Custom Actions** and endpoints).
- **CRUD Contracts**: `apps/backend/modules/<module-name>/models.yaml` (The Source of Truth for **Standard CRUD** endpoints via the `role` configuration).

## 3. Syntax Reference (`models.yaml`)

### Defining a Model (Database Entity)

Models defined here generate Prisma Schema definitions and Zod validation schemas.

```yaml
models:
  ReferralCode:
    fields:
      id:
        type: String
        attributes: ['@id', '@default(cuid())']
      code:
        type: String
        attributes: ['@unique']
      ownerId:
        type: String
      owner:
        type: User
        attributes: ['@relation(fields: [ownerId], references: [id])']
    attributes:
      - '@@index([ownerId])'
```

### Actor Configuration & Test Roles

Define how the generator treats your principal models and how to map logical roles for tests.

```yaml
config:
  test:
    roles:
      admin: { role: 'ADMIN' }
      member: { role: 'MEMBER' }

models:
  User:
    actor:
      name: user
      status: active
      strategy: bearer
      fields:
        tokenModel: PersonalAccessToken
        ownerField: userId
```

### Defining DTOs and Agent Payloads

Use `db: false` and `api: false` to create Zod schemas and TypeScript interfaces without database tables.

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

## 4. Custom API Actions: `api.yaml`

Use `api.yaml` for **Custom Actions**. Standard CRUD (List, Get, Create, Update, Delete) should be handled via the `role` block in `models.yaml`.

### Mapping Rules:

- **verb**: HTTP method (`GET`, `POST`, `PATCH`, `DELETE`).
- **method**: The logical name of the generated SDK method.
- **role**: Defines the required permission level (lowercase).
- **input**: The DTO model defined in `models.yaml`.
- **action**: Explicitly defines the filename in `src/actions/`.

### Action Implementation Requirements:

Manual Action classes MUST implement:
`public static async run(input: unknown, context: APIContext): Promise<ServiceResponse<any>>`

- **Validation**: Actions MUST define a `static schema` (Zod) and call `this.schema.parse(input)` inside the `run` method.
- **Scoping**: Use `context.locals.actor` for authorization and data scoping.
- **Rule**: Actions are STRICTLY FORBIDDEN from importing `db`. They must delegate to Services.

## 5. Manual Logic Layer (Services & Hooks)

### Static Service Pattern

- **Location**: `src/services/`
- **Rule**: Methods MUST be `public static async`.
- **Rule**: MUST accept `actor: ApiActor` as a parameter for security context.
- **Rule**: MUST return `Promise<ServiceResponse<T>>`.
- **Database Access**: Services are the primary authority for `db` access and transactions.

### Hook-Driven Extensibility

- **Registration**: Hooks in `src/hooks/` are auto-registered.
- **Database Access**: Direct `db` access is **permitted** in Hooks to maintain modularity and avoid service-to-service coupling.
- **Filters**: Use for data transformation (`beforeCreate`, `afterRead`).
- **Events**: Use for side-effects (`created`, `updated`).

## 6. Agentic Design (Autonomous Actors)

### Job Processor Pattern

1. **Source of Truth**: Define payload in `models.yaml` with `db: false, api: false`.
2. **Implementation**: Extend `JobProcessor<T>`.
3. **DB Access**: Direct `db` access is **permitted** for pragmatic implementation, though delegation to Services is recommended for reusable logic.

### Persistent Agent Pattern

Background workers implementing `tick()`. Direct `db` access is permitted.

## 7. Next Steps (Generator Protocol)

1. **Design**: Update `models.yaml` and `api.yaml`.
2. **Generate**: `nexical gen api <module-name>`.
3. **Implement**: Add manual Actions/Services or Hooks.
