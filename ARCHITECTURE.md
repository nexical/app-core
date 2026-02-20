# Architecture Guide: The Nexus Ecosystem

This document establishes the architectural standards for the **Nexus Ecosystem** (Nexus Base, TeamSeed, ArcNexus).

**The Golden Rule:** We do not build monolithic pages. We build a **SaaS Operating System (Shell)** that hosts **Dynamic Plugins (Registry)**. This architecture allows us to maintain three products from a single codebase without merge conflicts.

For coding standards (naming, TypeScript, JSDoc), strictly refer to [CODE.md](./CODE.md).

---

## 1. The "Shell & Registry" Architecture

We enforce a strict separation between the **Container** (Shell) and the **Content** (Registry).

### The Shell (Immutable Kernel)

- **Location:** `src/components/shell/`
- **Role:** The "Operating System." It handles the viewport, responsiveness, and layout physics.
- **Rule:** **DO NOT EDIT** the shell to add business features. Only edit it to fix layout bugs or add new "Zones."

### The Registry (User Space)

- **Location:** `modules/{name}/src/registry/` (Standard) or `src/registry/` (Core Overrides)
- **Role:** The "App Store." Every feature (Dashboard, User Profile) is a standalone file that "injects" itself into a specific zone.
- **Naming Convention:** `{order}-{kebab-name}.tsx` (e.g., `10-dashboard.tsx`). The `{order}-` prefix is the authoritative source for render order within a zone.
- **Selection Logic:** Context-aware registries (like the `ShellRegistry`) utilize **LIFO (Last-In-First-Out)** selection. The latest module to register a component for a specific condition wins. Selection iterates in reverse order of registration.
- **Client Directive:** Interactive registry components MUST include the `'use client';` directive at the top of the file to ensure proper hydration.

### Standardized UI Configuration (ui.yaml)

- **Location:** `modules/{name}/ui.yaml`
- **Role:** The declarative manifest for UI modules. It defines routing, shell associations, and registry metadata.
- **Rule:** Every UI module MUST provide a `ui.yaml` file. The generator uses this file to wire the module into the global shell.

### Core Neutrality Protocol

The platform adheres to a strict "Agnostic Core" policy:

- **Dual Discovery Mechanism**: The Core identifies and integrates modules using two complementary systems:
  - **Vite-Based (Runtime/Frontend)**: The `glob-helper.ts` uses `import.meta.glob` to gather code modules (initialization scripts, registry components, routes) during the build process and within the Astro application.
  - **Node-Based (Server/Build-Time)**: The `ModuleDiscovery` static utility class uses Node.js `fs` and `jiti` to load `module.config.mjs` and calculate phase-based execution order. This is used for server-side initialization and scripts.
- **Phased Execution Logic**: Modules are processed in a strict order defined by their `ModulePhase` (core -> provider -> feature -> integration -> theme) and an optional `order` priority within each phase. This ensures themes can consistently override feature logic.
- **Module Loaders**: All cross-module registration must occur through the `HookSystem` or dedicated `Registries` (e.g., `RoleRegistry`, `EmailRegistry`).
- **Registry Implementation Standards**:
  - **Singleton Registry Instance**: Registries MUST be implemented as classes with private `Map` storage and instance methods, exported as a single named constant instance to ensure a global singleton state and preserve insertion order.
  - **LIFO Override Priority**: Selection logic MUST follow a Last-In-First-Out (LIFO) pattern. When registering an item that might already exist, the old key MUST be deleted before setting the new one to ensure it moves to the end of the Map (highest priority).
  - **Polymorphic Matchers**: Registries MUST support "Matchers" that can be either static string patterns (globs like `/*` or `*`) or dynamic functional predicates.
  - **Strongly-Typed Selection Context**: While generic signatures MAY default to `on<T, C = unknown>`, specific registry implementations MUST define concrete, strongly-typed Context interfaces (e.g., `ShellContext`) for their selection logic. Never use `any` for context.
  - **Manual Glob Matching**: Implement lightweight, manual path matching for `/*`, `*`, and exact matches within the registry class to minimize core dependencies.
  - **Fire-and-Forget Parallelism**: Side-effect dispatching MUST use `Promise.allSettled` to execute all handlers in parallel without blocking.
  - **Sequential Pipelines**: Data filtering MUST use serial loops where the result of one handler is passed to the next in the chain.
  - **Listener Error Isolation**: Every external handler execution MUST be wrapped in a `try-catch` block to preserve system stability.
- **No Module Awareness**: No file in `src/` (outside of the module discovery helpers) should import directly from a module name unless that module is explicitly declared as a core provider.

---

## 2. Backend Architecture: Modular API

We utilize a 3-tier modular monolith architecture to ensure maintainability and separation of concerns.

### 3. Module Internals: The Service Layer Pattern

#### 1. The Controller (Actions)

- **Location:** `modules/{name}/src/actions/`
- **Naming Convention:** `{kebab-case}.ts`. Class name should be PascalCase.
- **Role:** The orchestration layer for complex business logic and multi-service workflows.
- **Responsibilities:**
  - **MANDATORY**: Define a `static schema` (Zod) for input validation.
  - **MANDATORY**: Call `this.schema.parse(input)` inside the `run` method to ensure type safety and data integrity.
  - **MANDATORY**: Implement the `public static async run(input: unknown, context: APIContext)` signature.
  - **MANDATORY**: Verify `context.locals.actor` exists and is authorized.
  - **RULE**: Actions MUST NOT access the 'db' (Prisma) directly. They MUST delegate all database operations to Services.
- **CENTRALIZED SDK**: All SDK access (methods, types) MUST be routed through `@/lib/api`. Use `api.{module}` for methods and `{Module}ModuleTypes` for types.
- **MIXED DIRECTORY:** Contains both machine-generated and manual files. **CRITICAL: NEVER edit files with the `// GENERATED CODE` header.**

#### 2. The API Page (Handlers)

- **Location:** `modules/{name}/src/pages/api/` (Generated) and `modules/{name}/src/pages/custom/` (Manual).
- **Role:** Request/Response lifecycle management.
- **CRITICAL:** Files in `src/pages/api/` are **STRICTLY GENERATED** from `api.yaml`. Do not edit them manually.
- **ESCAPE HATCH:** For custom endpoints (e.g., Webhooks, File Uploads) that cannot be defined in `api.yaml`, create them in `src/pages/custom/`.

#### 3. The Service (Business Logic)

- **Location:** `modules/{name}/src/services/`
- **Naming Convention:**
  - **Generated CRUD**: `{model}-service.ts` (STRICTLY GENERATED - DO NOT EDIT).
  - **Manual Domain Logic**: `{kebab-case}-service.ts`.
- **Role:** The "System of Record" authority and database gateway.
- **Responsibilities:**
  - Authority for specific model logic.
  - Handles database transactions (`db.$transaction`).
  - **GENERATED CRUD**: Follows `(data: Prisma.Input, select?: Prisma.Select, actor?: ApiActor)` signature.
  - **MANUAL LOGIC**: Public methods MUST be `public static async`, MUST accept an `actor: ApiActor` as the **FIRST** argument, and MUST return a `Promise<ServiceResponse<T>>`.
  - **MANDATORY**: Implement the 4-step "Hook-First" logic flow: **Filter Input -> Execute Logic -> Dispatch Side-Effects -> Filter Output**.
  - **MIXED DIRECTORY:** Contains both machine-generated CRUD services and manual domain logic.

#### 4. The Agent (Background Jobs)

- **Location:** `modules/{name}/src/agent/`
- **Naming Convention:** `{kebab-case}.ts`. Class name should be PascalCase with a functional suffix (`*Processor`, `*Agent`).
- **Role:** Asynchronous task processing.
- **Responsibilities:**
  - **MANDATORY**: Extend `JobProcessor<T>`.
  - **MANDATORY**: Define a `public static jobType: string`.
  - **MANDATORY**: Define a `public schema` (Zod) for payload validation.
  - **MANDATORY**: Access job data via `job.payload`.
  - **RULE**: Direct 'db' access is permitted for pragmatic implementation, but delegation to Services is recommended for reusable logic.

#### 5. Storage Provider Pattern

- **Location:** `src/lib/core/storage/`
- **Role:** Interface-based abstraction for file storage (Local vs R2/S3).
- **Rule:** Use the `getStorageProvider()` factory. Do not hardcode filesystem or S3 paths outside of provider implementations.

#### 6. The Data Layer (Prisma/DB)

- **Location**: `src/lib/core/db.ts`
- **Role**: The "System of Record" for all database operations.
- **Rule**: Backend layers (Services, Hooks, Agents) must import `db` from `@/lib/core/db`.
- **Prohibition**: Actions are strictly forbidden from importing this file. They MUST delegate to Services.

---

## 4. Security Patterns

### 1. Enumeration Prevention

Sensitive actions (password reset, etc.) **MUST NOT** leak user existence. Return consistent responses regardless of success/failure.

### 2. Pragmatic Data Access

While the Service Layer is the primary authority for database interactions, direct `db` access is permitted in Hooks and Agents to maintain modularity and avoid excessive service-to-service coupling. Actions remain strictly isolated.

---

## 5. The Hook System (Event Bus)

- **Location:** `src/lib/modules/hooks.ts`
- **Role:** Cross-module communication without coupling.
- **Registration**: Handled automatically via generated `server-init.ts`.
