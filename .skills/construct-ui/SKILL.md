---
name: construct-ui
description: Expert guide for building UI Modules, Surface Interfaces, and Registry Components using the Shell & Registry pattern.
---

# construct-ui Skill

## Critical Standards

You **MUST** follow the standards defined in:

- `core/THEME.md`: Semantic CSS and Surface Design.
- `core/ARCHITECTURE.md`: Shell & Registry Architecture.
- `core/MODULES.md`: Shell Registry, Head Registry, Federated SDK.
- **Core Neutrality**: The core platform must never know what modules are installed on the system. If the core needs to know information about modules it should implement module loaders or registries.

## Strict Quality Standards

- **Zero Tolerance for `any`**: The use of `any` is strictly prohibited. You MUST use specific types, `unknown` with validation, or proper interfaces. There are NO exceptions to this rule.
- **ESLint Compliance**: All code you generate must be strictly compliant with the project's ESLint rules. Always proactively check for and resolve any linting errors provided in tool feedback.
- **Permissions**: Always use `Permission.check()` from the corresponding API module to verify access before rendering sensitive UI components or performing actions.
- **Internationalization**: NEVER hardcode user-facing strings. Use the `useTranslation` hook and module-prefixed keys.
- **Centralized SDK**: ALWAYS use the `api` object from `@/lib/api/api` (NOT `@/lib/api`). Call methods via `api.{module}.{method}`. Direct imports from module SDKs are forbidden.
- **Service Response Pattern**: API calls return a `ServiceResponse<T>`. You MUST check `result.success` before accessing data.
- **Transition-Based Mutation**: Use React's `useTransition` for all async API state updates to ensure UI responsiveness.
- **Mandatory Configuration**: Every UI module MUST have a `ui.yaml` file in its root directory defining its routing, shells, and registry metadata.

## 1. Core Hooks

Accessing global state and controlling the shell environment is done through these hooks:

- **useNavData()**: Accesses global application state (user info, active team, context) hydrated by middleware. Use this to avoid prop-drilling.
- **useShellStore()**: Manages cross-cutting UI actions like opening detail panels, sidebars, or toggling mobile menus.

## 2. Component Types & Exports

### Registry Components (`src/registry/**`)

Small UI fragments that plug into the core shell zones.

- **Directive**: MUST start with `'use client';` as they are interactive React components.
- **Path**: `apps/frontend/modules/{name}/src/registry/{zone}/{order}-{kebab-name}.tsx`
- **Export**: **DEFAULT Export** only.
- **Naming**: Must follow the pattern `{order}-{kebab-name}.tsx` (e.g., `20-user-menu.tsx`).
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
- **Rule**: Do not modify generated components directly. Use the Injection Pattern.

## 3. Module Lifecycle & Configuration

Every module requires specific files to integrate with the ecosystem:

- **ui.yaml**: Mandatory manifest for routing and registry configuration.
- **module.config.mjs**: Defines module metadata and build-time configuration.
- **middleware.ts**: Handles request-time logic, data hydration (NavData), and protection.
- **server-init.ts**: Server-side initialization logic.
- **src/init.ts**: Isomorphic initialization for registering shells and assets.

## 4. Security & Page Protection

Every Astro page must be protected.

- **Rule**: Every `.astro` file in `src/pages` MUST import `PageGuard` and call `protect()` before any other logic.
- **Template**: `templates/page.astro`

```typescript
import { PageGuard } from '@/lib/ui/page-guard';

// MUST be the first await in the frontmatter
const guard = await PageGuard.protect(Astro, 'anonymous');
if (guard) return guard;
```

## 5. Forms & Validation

Forms must use `react-hook-form` combined with `zod` for validation.

- **Rule**: Component MUST start with `'use client';`.
- **Pattern**:
  1.  Define Zod schema wrapped in a function `(t) => z.object(...)` using **prefixed** i18n keys.
  2.  Use `zodResolver`.
  3.  Use custom UI components (e.g., `Input`, `Button`) from `@/components/ui/`.
  4.  Catch errors using the `ApiError` type to extract structured messages.
- **Template**: `templates/form-component.tsx`

## 6. Testing Protocols (Mandatory)

### Testability (data-testid)

- **Rule**: All interactive elements (buttons, inputs, links, wrappers) MUST have a `data-testid` attribute.
- **Rule**: Use stable, descriptive IDs (e.g., `user-menu-trigger`).

### E2E - Page Object Model

- **Rule**: Extend `BasePage`.
- **Rule**: Use `this.safeGoto()` for navigation.
- **Rule**: Call `this.byTestId()` directly within methods.
- **Template**: `templates/e2e-page.ts`

## 7. Styling (`styles.css`)

- **Rule**: Wrap all module styles in `@layer components`.
- **Rule**: Use semantic variables and surface utilities (e.g., `@apply surface-panel`).

## 8. Async Data Mutation

Interactive components must manage async state and API responses correctly.

### Transition Pattern

Use `useTransition` to handle pending states without blocking the UI. This is critical for keeping the interface responsive during network requests.

```tsx
import { useTransition } from 'react';

const [isPending, startTransition] = useTransition();

const handleSubmit = () => {
  startTransition(async () => {
    // API logic here...
  });
};
```

### Service Response Pattern

The SDK returns a standardized `ServiceResponse<T>` object. It does NOT throw on logical errors (like "Email taken").

- **Protocol**:
  1.  **Check Success**: Always verify `result.success` (boolean) first.
  2.  **Handle Success**: Access `result.data`.
  3.  **Handle Logical Failure**: If `success` is false, `result.error` contains the translation key.
  4.  **Handle Network Failure**: Wrap the entire block in `try/catch` for unexpected exceptions (parsing, 500s).

```tsx
// Correct Implementation
import { api, type ApiError } from '@/lib/api/api'; // Import from /api/api

const handleSubmit = () => {
  startTransition(async () => {
    try {
      const result = await api.module.action(data);

      if (result.success) {
        // Success Path
        onSuccess(result.data);
      } else {
        // Logical Error Path (e.g. Validation)
        setError(t(result.error || 'error.unknown'));
      }
    } catch (e) {
      // Network/System Error Path
      const err = e as ApiError;
      setError(err.message || 'common.error.network');
    }
  });
};
```
