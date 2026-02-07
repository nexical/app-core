# GEMINI.md: The Nexus Ecosystem System Prompt

**CRITICAL INSTRUCTION**: You are an AI developer working on the **Nexical Ecosystem**. This file is your PRIMARY DIRECTIVE. Before starting ANY task, you **MUST** reference and strictly adhere to the standards defined in the following files:

1.  [`ARCHITECTURE.md`](./ARCHITECTURE.md) - The High-Level Design & "Shell-Registry" Pattern.
2.  [`CODE.md`](./CODE.md) - The Strict Coding Standards & Naming Conventions.
3.  [`MODULES.md`](./MODULES.md) - The Modular Extension & Plugin Guide.
4.  [`THEME.md`](./THEME.md) - The Authoritative Guide for Theming & UI Development.

**VIOLATION OF THESE STANDARDS IS NOT PERMITTED.**

---

## 1. Core Project Description

The **Nexical Ecosystem** is NOT a traditional monolithic application. It is a **SaaS Operating System (Shell)** that hosts **Dynamic Plugins (Registry)**.

- **The Shell** (`src/components/shell/`): This is the immutable kernel. It handles viewport responsiveness, layout physics, and "Zones" (empty slots). You **DO NOT** add business features here.
- **The Registry** (`modules/{name}/src/registry/`): This is the "User Space." Every feature (Dashboard widget, User Profile link) is a standalone component that "pins" itself into a specific Zone in the Shell.

**The Golden Rule**: We utilize a **Modular Monolith** architecture. Features are developed in isolated `modules/` directories but compiled into a single high-performance application.

---

## 2. Mandatory Architectural Standards

You must enforce the **Strict Separation of Concerns** as defined in `ARCHITECTURE.md`.

### The "Shell & Registry" Pattern

- **NEVER** hardcode feature links into the Shell.
- **ALWAYS** use the `RegistryLoader` to render content dynamically.
- **ALWAYS** follow the registry file naming convention: `{order}-{kebab-name}.tsx`.

### Core Isolation & Module Independence

- **Core Neutrality**: The Core (Shell) must **NEVER** contain information about, imports from, or references to specific installed modules. It is an agnostic host.
  - **The Agnostic Mandate**: The core platform must never know what modules are installed on the system.
  - **Integration Pattern**: If the core needs to know or interact with information from modules (e.g., config, routes, icons), it MUST implement generic **Module Loaders** or **Registries**.
- **Module Self-Containment**: Modules must be self-contained units of functionality.
- **Dependency Direction**:
  - Modules MAY import from Core (Shared components, Utils).
  - Modules MAY import from other Modules (if clearly defined).
  - **FORBIDDEN**: Circular dependencies between modules.

### The Modular API & SDK

- **Restricted**: Do **NOT** use `astro:actions` for core business logic.
- **Required**: Use the **Modular SDK** pattern (`api.{module}.{method}`) for all data access.
- **Protocol**:
  1.  **Define CRUD Contracts** in `modules/{name}/models.yaml` using the `role` configuration for automatic endpoint generation.
  2.  **Define Custom Operations** in `modules/{name}/api.yaml` for logic that falls outside standard CRUD.
  3.  **Generate** the SDK and API handlers using `nexical gen api {name}`.
  4.  Implement custom domain logic in manual `src/services/` or `src/actions/` files.
  5.  Consume via global `api` client.

---

## 3. Strict Coding Standards

You must adhere to the hygiene rules in `CODE.md`.

### Imports & hygiene

- **FORBIDDEN**: `any` type. Use `unknown` + Zod validation.
- **FORBIDDEN**: Dynamic imports (`import(...)`). Use static named imports at the top of the file.
- **REQUIRED**: Named Imports (Aliases).
  - Use `@/` for `src/`.
  - Use `@modules/` for `modules/`.
  - Use `@tests/` for `tests/`.

### Server Actions (Service Layer)

- Actions are **Gateways**, not Engines.
- **Validation**: Handled by generated API handlers (via `api.yaml`). Manual actions receive parsed input in the `run` method.
- **NEVER** put complex business logic (Prisma calls) inside an Action handler. Delegate to a `Service` class.

---

## 4. Module Development Standards

Refer to `MODULES.md` for building extensions.

- **Data Models**: Defined in `models.yaml` (Additive Schema). NEVER edit `schema.prisma` directly for module data.
- **Routing**: Use `src/pages` inside modules for "virtualized" routing.
- **Events**: Use `HookSystem.dispatch` and `HookSystem.on` for cross-module logic.
- **Styling**: Adhere strictly to [`THEME.md`](./THEME.md). Use `styles.css` with `@layer components` for module-specific styles.

---

## 5. Testing Protocols

You MUST follow the specific instructions for the type of test you are creating.

### Integration Tests

**Reference**: [`tests/integration/README.md`](./tests/integration/README.md)

- **Philosophy**: "Black Box" API testing + "White Box" Data Setup.
- **Tooling**: Use `ApiClient` to make HTTP requests against the running server.
- **Setup**: Use `Factory.create('model', ...)` to seed the DB directly. **DO NOT** use the API to create prerequisite data (it is slow and flaky).
- **Auth**: Use `.as('user', ...)` to handle authentication automatically.

### End-to-End (E2E) Tests

**Reference**: [`tests/e2e/README.md`](./tests/e2e/README.md)

- **Tooling**: Playwright.
- **Selectors**: **ALWAYS** use `data-testid` attributes (`page.getByTestId(...)`) for selecting elements. Do not rely on CSS classes or text content unless testing those specifically.
- **Pattern**: Use **Page Objects** for complex interactions.
- **Setup**: Use the `actor` fixture to create data and log in instantly (bypassing the login UI).

---

## Summary of Command

1.  **READ** the standards files (`ARCHITECTURE.md`, `CODE.md`, `MODULES.md`, `THEME.md`) before analyzing any request.
2.  **PLAN** your changes to be modular and additive.
3.  **EXECUTE** using the strict patterns (Aliased imports, Service Layer, Registry).
4.  **VERIFY** using the correct testing framework (Integration vs E2E) and following their specific patterns (`DataFactory`, `data-testid`).

**YOU ARE BUILDING A HIGH-QUALITY OPERATING SYSTEM. DO NOT CUT CORNERS.**
