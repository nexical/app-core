# Coding Standards

This document establishes the authoritative coding standards for the project. These standards are enforced to ensure maintainability, scalability, and clarity across the codebase.

## 1. Core Philosophy

### AI-Native Context

- **Context is King**: Write code that explains itself. Generative AI relies on clear variable names and explicit types to understand intent.
- **Explicit over Implicit**: Avoid "magic" logic. If a function does something side-effective, name it clearly.
- **Small Blast Radius**: Keep functions and components focused. A single file should ideally fit within a standard LLM context window (approx. 200 lines) to facilitate easier AI reasoning and refactoring.

### Strictness

- **Sanity over Speed**: We prefer verbose, type-safe code over concise but brittle one-liners.
- **Zero Warnings**: The main branch must effectively be warning-free. Address lint warnings immediately.

---

## 2. TypeScript Standards

We adhere to **Strict TypeScript** configuration.

### Type Safety

- **No `any`**: The use of `any` is **strictly forbidden**.
  - If a type is truly dynamic, use `unknown` and validate it with a runtime schema validator (like Zod) before usage.
- **No `ts-ignore`**: Do not suppress TypeScript errors. Fix the underlying issue.

### Interfaces vs Types

- **Interfaces**: Use `interface` for public contracts, component props, and object definitions that might be extended.
- **Types**: Use `type` for unions (`type Status = 'loading' | 'success'`), intersections, and aliases of primitives.

### Return Types

- **Explicit Returns**: All exported functions and methods **MUST** have an explicit return type. This prevents accidental API surface changes.
  - _Bad_: `export const getUser = () => { ... }`
  - _Good_: `export const getUser = (): Promise<User> => { ... }`

### Null Checks

- **Optional Chaining**: Prefer optionally chained access (`data?.user?.name`) over verbose logical ANDs (`data && data.user && data.user.name`).
- **Nullish Coalescing**: Use `??` for default values instead of `||` to strictly handle `null`/`undefined` without catching falsey values like `0` or `false`.

### Uniform Service Response

- **Standardized Wrapper**: All public methods in **Services** and **Actions** MUST return a `ServiceResponse<T>` object.
- **Structure**: The object must contain:
  - `success`: Boolean indicating if the operation succeeded.
  - `data`: The payload on success (optional/nullable on failure).
  - `error`: A **string** containing the translation key or error message on failure (null on success).
  - `total?`: Optional count for paginated results.
- **Mandatory Check**: Callers **MUST** always check the `success` flag before accessing the `data` property. Accessing `.data` without a success check is an anti-pattern.
- **Purpose**: This ensures consistent error handling and data access across all layers of the modular monolith.

---

## 3. Files & Imports

We enforce a strict module resolution strategy to avoid spaghetti dependencies.

### Import Aliases

- **Mandatory Aliases**: You **MUST** use absolute import aliases for all internal code.
  - `@/` refers to `src/`.
  - `@modules/` refers to `modules/`.
  - `@tests/` refers to `tests/`.
- **Whitespace**: A **SINGLE SPACE** is mandatory after the opening quote for all internal aliases and workspace packages (e.g., `'@/'`, `'@modules/'`, `'@nexical/agent'`).
- **Forbidden**: Deep relative imports that traverse up the tree (e.g., `../../components/button`).

### Relative Imports

- **Siblings Only**: You **MAY** use relative imports (`./`) for files within the **same directory**.
  - _Good_: `import { Helper } from './helper';`
  - _Bad_: `import { Button } from '../ui/button';` (Use `@/components/ui/button`)

### Export Strategy

- **Named Exports**: Prefer named exports for utilities, hooks, and libraries to ensure better tree-shaking and explicit importing.
- **Default Exports**: Use default exports ONLY for:
  - React Components (Pages/Layouts) that are lazy-loaded.
  - Configuration files required by frameworks (e.g., `astro.config.mjs`).

---

## 4. Styling & CSS

We use a utility-first approach powered by **Tailwind CSS**.

### Utility-First

- **No Arbitrary Values**: Avoid using arbitrary values strings like `w-[123px]` or `bg-[#F0F0F0]`.
  - Use the theme tokens (`w-32`, `bg-muted`). If a value is missing, add it to the Tailwind config or CSS variables.
- **Semantic Colors**: Use semantic variable names (`bg-destructive`, `text-primary`) rather than hardcoded palette names (`bg-red-500`) to ensure dark mode compatibility.

### Class Management

- **Conditional Classes**: Use a utility like `cn` (clsx + tailwind-merge) for conditional class application.
  - _Bad_: ``className={`btn ${isActive ? 'active' : ''}`}``
  - _Good_: `className={cn('btn', isActive && 'active')}`

### Global CSS

- **Variables**: Define theme values as CSS variables in a global stylesheet. Do not hardcode hex values in components.

---

## 5. Syntax & Formatting

We rely on **Prettier** and **ESLint** to handle formatting. Do not rely on manual formatting.

- **Semi-colons**: Always use semi-colons.
- **Quotes**: Use single quotes `'` for string literals, double quotes `"` for JSX attributes.
- **Unused Variables**: Unused variables are treated as errors. Prefix with `_` if they are structurally necessary (e.g., in function arguments).
- **Immutability**: Prefer `const` over `let`. Never use `var`.

---

## 6. Documentation

Documentation is part of the code, not an afterthought.

### JSDoc

- **Exported Members**: All exported functions, classes, and interfaces should have a JSDoc block explaining **why** it exists and any edge cases.
- **Complex Logic**: Use inline comments to explain algorithmic complexity or non-obvious business logic.

```ts
/**
 * Calculates the exponential backoff delay.
 * @param attempt - The current retry attempt (0-indexed).
 * @returns The delay in milliseconds.
 */
export const calculateBackoff = (attempt: number): number => {
  // Cap at 30 seconds to prevent infinite stalling
  return Math.min(1000 * 2 ** attempt, 30000);
};
```
