---
name: verify-quality
description: Expert strategy for Testing. Defines the strict "White Box Setup / Black Box Execution" protocol.
---

# verify-quality Skill

## Critical Standards

You **MUST** follow the standards defined in:

- `GEMINI.md`: Testing protocols.
- `ARCHITECTURE.md`: Module Internals & Service Layer.
- **Core Neutrality**: The core platform must never know what modules are installed on the system. If the core needs to know information about modules it should implement module loaders or registries.
- `tests/integration/README.md`: Integration guide.
- `tests/e2e/README.md`: E2E guide.

## 0. General Rules

- **Path Aliases**: REQUIRED: Use ` @/` for `src/`, ` @modules/` for `modules/`, and ` @tests/` for `tests/`. NEVER use relative imports (e.g., `../../`).
- **Mixed Directory Discipline**: Do not write unit tests for files containing the `// GENERATED CODE` header. Focus on manual logic in `{kebab-case}-service.ts` or `{kebab-case}-action.ts`.
- **Database Import**: ALWAYS import the database client from ` @/lib/core/db`.

## 1. Integration Tests (API)

- **Goal**: Verify the Service Layer + API Contract + DB interactions + Hook Side Effects + Security.
- **Tool**: Vitest + `ApiClient`.
- **Scope**:
  - Module-specific: `modules/<name>/tests/integration/**/*.test.ts`
  - System-wide: `tests/integration/**/*.test.ts`

### Protocol

1.  **Arrange (White Box)**: Use `Factory.create()` to seed the DB directly. **NEVER** use the API to create prerequisite data.
2.  **Act (Black Box)**: Use `client.as(user).post(...)` to hit the real HTTP endpoint.
3.  **Assert**:
    - Check the HTTP response (Status, Body).
    - Check DB Side Effects (using `Factory.prisma.{model}.findUnique()`).
    - Check Hook Side Effects (did the listener modify data or trigger another event?).
4.  **Security**: ALWAYS include test cases for unauthorized access (Guest/Wrong Role) to verify `ApiGuard` protection. Expect `403` for forbidden actions.

### Template

Refer to `templates/integration-test.ts`.

## 2. E2E Tests (UI)

- **Goal**: Verify the User Flow + Browser interactions.
- **Tool**: Playwright.
- **Scope**:
  - Module-specific: `modules/<name>/tests/e2e/**/*.spec.ts`
  - System-wide: `tests/e2e/**/*.spec.ts`

### Protocol

1.  **Login**: Use the `actor` fixture: `await actor.as('user')`. Do not automate the login page UI unless testing Auth.
2.  **Selectors**: ALWAYS use `page.getByTestId('id')`. Never use CSS classes or XPaths.
3.  **Hydration**: If clicking a button doesn't work, wait for hydration: `await expect(page.getByTestId('btn')).toBeEnabled()`.

### Template

Refer to `templates/e2e-test.ts`.

## 3. Unit Tests (Logic)

- **Goal**: Verify complex algorithms, Service logic, Action orchestration, and Regex.
- **Tool**: Vitest.
- **Scope**: `modules/<name>/tests/unit/**/*.test.ts`
- **Mocking**: Allowed and encouraged for Unit Tests (mock DB/db, other Services, HookSystem). **FORBIDDEN** for Integration/E2E.

### Protocol

1.  **Isolate**: Mock external dependencies (Database ` @/lib/core/db`, other Services).
2.  **Service Response**: Ensure all service mocks return a `Promise<ServiceResponse<T>>`. Assertions must check `result.success` and `result.data`.
3.  **Hooks**: Verify `HookSystem.dispatch` (side effects) and test `HookSystem.filter` (data modification) by mocking the filter response.
4.  **Verify**: Ensure correct calls to dependencies.

### Template

Refer to `templates/service-unit-test.ts`.

## 4. Async & Background Tests (Processors)

- **Goal**: Verify background `JobProcessor` logic.
- **Tool**: Vitest.
- **Scope**: `modules/<name>/tests/unit/processors/**/*.test.ts`

### Protocol

1.  **Unit Test**: Instantiate the Processor class directly.
2.  **Mock Context**: Pass a mocked `AgentJob` and `AgentContext` object from ` @nexical/agent`.
3.  **Method Signature**: The `process` method must accept two parameters: `process(job: AgentJob, context: AgentContext)`.
4.  **Data Access**: Verify the processor uses Services/SDK rather than importing `db`.
5.  **Assert**: Verify the `process` method returns a `ServiceResponse` or handles them correctly.

### Template

Refer to `templates/processor-test.ts`.
