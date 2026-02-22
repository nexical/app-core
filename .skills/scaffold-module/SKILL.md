---
name: scaffold-module
description: Expert usage of the 'arc' CLI (or manual fallback) to generate correctly structured modules within the Nexus Ecosystem.
---

# scaffold-module Skill

## Critical Standards

You **MUST** follow the standards defined in:

- `core/MODULES.md`: Module types (API vs UI vs Email), Naming conventions, Phase loading.
- `core/ARCHITECTURE.md`: Core Neutrality.
- **Core Neutrality**: The core platform must never know what modules are installed on the system. If the core needs to know information about modules it should implement module loaders or registries.

## Strict Quality Standards

- **Zero Tolerance for `any`**: The use of `any` is strictly prohibited. You MUST use specific types, `unknown` with validation, or proper interfaces. There are NO exceptions to this rule.
- **ESLint Compliance**: All code you generate must be strictly compliant with the project's ESLint rules. Always proactively check for and resolve any linting errors provided in tool feedback.

## 1. The Module Types (Strict Separation)

We strictly separate concerns into distinct packages. Standard CRUD logic is managed by the generator.

### API Module (`*-api`)

- **Purpose**: Backend logic, Database, Services, Security.
- **Structure**:
  ```text
  apps/backend/modules/my-feature-api/
  ├── package.json          # @modules/my-feature-api
  ├── models.yaml           # Data Schema (Additive)
  ├── api.yaml              # REST API Definition (OpenAPI)
  ├── src/
  │   ├── actions/          # Mixed: manual logic uses (input, context: APIContext)
  │   ├── services/         # Mixed: model-service.ts (GENERATED) vs kebab-service.ts
  │   ├── agent/            # Background logic (JobProcessor, PersistentAgent)
  │   ├── hooks/            # Event Listeners (HookSystem)
  │   ├── roles/            # Permission Policies (RolePolicy)
  │   ├── pages/api/        # (STRICTLY GENERATED) Standard endpoints
  │   ├── pages/api/custom/ # Manual "Escape Hatch" endpoints
  │   ├── sdk/              # (STRICTLY GENERATED) Type-safe Client
  │   └── server-init.ts    # (STRICTLY GENERATED) Registration entry
  └── tests/
      └── integration/      # Black Box API Tests
  ```

### UI Module (`*-ui`)

- **Purpose**: Frontend components, Registry items, Pages.
- **Structure**:
  ```text
  apps/frontend/modules/my-feature-ui/
  ├── package.json          # @modules/my-feature-ui
  │   ├── styles.css            # Tailwind Layers (@layer components)
  │   ├── ui.yaml               # UI Generator Configuration (Feature, Forms, Tables)
  │   ├── src/
  │   │   ├── registry/         # "Pins" for the Shell ({order}-{name}.tsx)
  │   │   ├── components/       # Reusable Components (Generated & Manual)
  │   │   ├── pages/            # Astro Pages (Routing)
  │   │   └── init.ts           # Isomorphic registration
  ```

## 2. Creation Workflow (CLI)

Prefer using the CLI to ensure all boilerplate is correct.

```bash
# 1. Scaffold base
nexical gen api <name>

# 2. Define data/endpoints in models.yaml & api.yaml

# 3. Generate implementation
nexical gen api <name>
```

## 3. Mandatory Code Patterns

### Action Pattern (`src/actions/`)

- **Role**: Entry point for complex logic.
- **Signature**: `public static async run(input: T, context: APIContext): Promise<ServiceResponse<R>>`.
- **Scoping**: Use `context.locals.actor` for authorization.

### Agent Layer (`src/agent/`)

- **JobProcessor**: Processes discrete tasks from the queue.
- **PersistentAgent**: Background loop using `tick()`.
- **RULE**: NEVER import `db` in an Agent. Use Services or the SDK.

### Registry Convention (`src/registry/`)

- **Naming**: Files MUST follow `{order}-{kebab-name}.tsx` (e.g., `10-dashboard-widget.tsx`).
- **Zones**: Components are "pinned" to Shell Zones defined in `core/ARCHITECTURE.md`.

### UI Configuration (`ui.yaml`)

- **Purpose**: A "Control Plane" that directs the generator.
- **Rule**: Use `ui.yaml` to inject custom components into generated forms instead of editing the generated file directly.
- **Structure**:

  ```yaml
  # 1. Feature Configuration
  type: feature
  order: 50

  # 2. Forms Configuration (Map model fields to components)
  forms:
    User:
      # Simple override
      password:
        component:
          name: PasswordInput
          path: '@/components/ui/password-input'
      # Complex injection
      avatarUrl:
        component:
          name: AvatarUpload
          path: '@/components/ui/avatar-upload'

  # 3. Tables Configuration
  tables:
    User:
      editMode: sheet # 'sheet' (Side Panel) or 'dialog' (Modal Center)

  # 4. Registry Configuration (The "Plugs")
  registries:
    nav-main:
      - name: 'user-link'
        component: '@/components/nav/UserLink'
        guard: ['admin']
  ```

## 4. Post-Scaffold Actions

1.  **Install**: `npm install`
2.  **Generate SDK**: `nexical gen api <name>` (for API modules).
3.  **Audit**: `nexical audit api <name>` (Verify structure compliance).
