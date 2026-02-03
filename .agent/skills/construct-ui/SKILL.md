---
name: construct-ui
description: Expert guide for building UI Modules, Surface Interfaces, and Registry Components using the Shell & Registry pattern.
---

# construct-ui Skill

## Critical Standards

You **MUST** follow the standards defined in:

- `THEME.md`: Semantic CSS and Surface Design.
- `ARCHITECTURE.md`: Shell & Registry Architecture.
- `MODULES.md`: Shell Registry, Head Registry, Federated SDK.
- **Core Neutrality**: The core platform must never know what modules are installed on the system. If the core needs to know information about modules it should implement module loaders or registries.

## 1. Security (MANDATORY)

Every Astro page must be protected.

- **Rule**: Every `.astro` file in `src/pages` MUST import `PageGuard` and call `protect()` before any other logic.
- **Template**: `templates/page.astro`

```typescript
import { PageGuard } from '@/lib/ui/page-guard';

// MUST be the first await in the frontmatter
const guard = await PageGuard.protect(Astro, 'anonymous');
if (guard) return guard;
```

## 2. Component Types & Exports

### Registry Components (`src/registry/**`)

Small UI fragments that plug into the core shell zones.

- **Path**: `modules/{name}/src/registry/{zone}/{order}-{kebab-name}.tsx`
- **Export**: **DEFAULT Export** only.
- **Naming**: Must start with a number for ordering (e.g., `20-user-menu.tsx`).
- **Template**: `templates/registry-component.tsx`

### Feature Components (`src/components/{feature}/**`)

UI components organized by sub-feature (auth, admin, settings) within the module.

- **Export**: **NAMED Export** (e.g., `export function LoginForm()`).
- **Naming**: Kebab-case filenames.
- **Rule**: Use sub-folders to isolate features (e.g. `src/components/auth/login-form.tsx`).

### Generated Components (`src/components/{Model}{Type}.tsx`)

- **Table**: `{Model}Table.tsx` (TanStack Table).
  - **Configuration**: Controlled by `tables` in `ui.yaml`.
- **Form**: `{Model}Form.tsx` (React Hook Form + Zod).
  - **Configuration**: Controlled by `forms` in `ui.yaml`.
- **Rule**: Do not modify generated components directly.

## 3. Hybrid Development (Manual + Generated)

The generator enforces strict ownership of specific files via the `// GENERATED CODE` header.

### The Injection Pattern (Composition)

Instead of modifying generated forms, build standalone components and inject them via `ui.yaml`.

1. **Create Manual Component**: `src/components/ui/custom-avatar.tsx`
2. **Inject in `ui.yaml`**:
   ```yaml
   forms:
     User:
       avatarUrl:
         component:
           name: CustomAvatar
           path: '@/components/ui/custom-avatar'
   ```

### The Ejection Pattern (Takeover)

If a generated component restricts you too much:

1. **Remove** the `// GENERATED CODE` header from the top of the file.
2. The Reconciler will now treat this file as **Manual Code**.
3. It will no longer receive updates from the generator. You own it completely.

## 4. Forms & Validation

Forms must use `react-hook-form` combined with `zod` for validation.

- **Pattern**:
  1.  Define Zod schema wrapped in a function `(t) => z.object(...)` using **prefixed** i18n keys (e.g., `user.validation.error`).
  2.  Use `zodResolver`.
  3.  Use custom UI components (e.g., `Input`, `PasswordInput`) from the project's UI library.
  4.  Catch errors using the `ApiError` type and cast to extract structured server messages.
- **Template**: `templates/form-component.tsx`

## 5. Initialization (`src/init.ts`)

Each module requires an isomorphic entry point to register its shells and assets.

- **Rule**: Use the `async function init{ModuleName}Module()` naming convention.
- **Rule**: Include an immediate self-execution call at the bottom of the file for registration discovery.
- **Template**: `templates/init.ts`

```typescript
export async function initUserModule() {
  ShellRegistry.register('user', UserShell, (ctx) => ctx.url.pathname.startsWith('/user'));
}
initUserModule();
```

## 6. Testing Protocols

### End-to-End (E2E) - Page Object Model

Tests must use the Page Object Model (POM) to abstract interactions and ensure maintainability.

- **Rule**: Extend `BasePage`.
- **Rule**: Use `this.safeGoto()` for navigation.
- **Rule**: Call `this.byTestId()` directly within action/verification methods (do not store as private members).
- **Rule**: Implement `visit()` and `verifyLoaded()` methods.
- **Template**: `templates/e2e-page.ts`

### Selectors

- **Rule**: All interactive elements (buttons, inputs, links) MUST have a `data-testid` attribute.
- **Do Not**: Rely on CSS classes or text content for selection.

## 7. Styling (`styles.css`)

- **Semantic**: Use classes like `.surface-panel`, `.btn-primary`.
- **Layered**: Wrap in `@layer components`.
