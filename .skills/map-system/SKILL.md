---
name: map-system
description: Maintains the "Constitution." It updates the global PROJECT_MAP.md so the AI always knows the current state of the architecture.
---

# map-system Skill

## Critical Standards

You **MUST** follow the standards defined in:

- `core/ARCHITECTURE.md`: Separation of concerns.
- `core/CODE.md`: Coding style and hygiene.
- `core/MODULES.md`: Module structure.
- **Core Neutrality**: The core platform must never know what modules are installed on the system. If the core needs to know information about modules it should implement module loaders or registries.

## Strict Quality Standards

- **Zero Tolerance for `any`**: The use of `any` is strictly prohibited. You MUST use specific types, `unknown` with validation, or proper interfaces. There are NO exceptions to this rule.
- **ESLint Compliance**: All code you generate must be strictly compliant with the project's ESLint rules. Always proactively check for and resolve any linting errors provided in tool feedback.

This skill is the **Cartographer**. Its job is to keep `PROJECT_MAP.md` up to date, ensuring the AI has an accurate map of the system's "User Space" (Modules) and "Kernel" (Shell).

## 1. Goal

Ensure the AI doesn't hallucinate about the system state by maintaining a canonical map of architectural components, focusing strictly on manual "User Space" logic while acknowledging generated boilerplate.

## 2. Actions

- **Scan**: Read `apps/backend/modules/` and `apps/frontend/modules/` recursively to identify active modules.
  - **Identify Patterns**: For each module, catalog the Canon components.
    - **CRITICAL (Mixed Directory Policy)**: Skip any file containing the `// GENERATED CODE` header to focus on manual implementation.
    - **Services**: `src/services/*.ts`. **Validation**: Verify public methods return `Promise<ServiceResponse<T>>`. Flag deviations as "Architecture Drift."
    - **Actions**: `src/actions/*.ts`. **Validation**: Verify `static async run(input, context: APIContext)` signature.
    - **Agents**: `src/agent/*.ts` (Persistent Agents and Job Processors).
    - **Hooks**: `src/hooks/*.ts` (Event listeners and filters).
    - **Roles**: `src/roles/*.ts` (Authorization Policies).
    - **API Routes**: `src/pages/api/**`. Distinguish between **GENERATED** (from `api.yaml`) and **MANUAL** (Escape Hatches). Manual routes should be flagged for review if they aren't in a `test/` or `custom/` sub-directory.
- **Update**: Regenerate `PROJECT_MAP.md` using the template at `.agent/skills/map-system/templates/PROJECT_MAP.md`.
  - **Metadata**: Extract description from `package.json` (fallback to "No description provided").
  - **Structure**: Group by Module -> Component Type.
- **Registry Verification**: Check `apps/frontend/modules/{name}/src/registry/` to ensure modules are correctly registered for UI injection.

## 3. When to use

- After creating a new module (`scaffold-module`).
- After a major refactor or adding new Services/Actions/Agents.
- If the user asks "What does this project do?" or "Show me the system architecture."
