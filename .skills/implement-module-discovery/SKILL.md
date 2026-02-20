# Skill: Implement Module Discovery

This skill governs the implementation and extension of the module discovery system within the Nexical Ecosystem. It ensures that the core remains agnostic while allowing modules to inject configuration, code, and assets.

## Overview

The discovery system is split into two complementary mechanisms to handle the distinct requirements of build-time sorting and runtime execution.

### 1. Node-Based Discovery (`ModuleDiscovery`)

Located in `core/src/lib/modules/module-discovery.ts`, this static utility class is used for server-side and build-time operations where access to the Node.js filesystem (`fs`) is available.

- **Purpose**: Loading `module.config.mjs`, calculating phase-based execution order, and gathering high-level metadata.
- **Mechanism**: Uses `fs.readdirSync` and `jiti.import`.
- **Phases**: Modules are sorted by `type` (`core` -> `provider` -> `feature` -> `integration` -> `theme`) and then by `order`.

### 2. Vite-Based Discovery (`glob-helper.ts`)

Located in `core/src/lib/core/glob-helper.ts`, this utility uses Vite's `import.meta.glob` feature. It is the primary discovery mechanism for the Astro/Vite application.

- **Purpose**: Gathering code modules (initialization scripts, registry components, routes, locales) that need to be bundled.
- **Mechanism**: Uses static glob patterns evaluated at compile-time.

---

## Standards & Patterns

### 1. Static Utility Class Implementation

All discovery logic MUST be implemented as static methods on a utility class or as exported functions. This ensures encapsulation and ease of use without instantiation.

### 2. Type-Safe Configuration (`ModuleConfig`)

- **Prohibition**: The `any` type is strictly forbidden.
- **Rule**: Use `unknown` for dynamic or unknown properties in `ModuleConfig` interfaces.
- **Validation**: Always validate dynamic configuration before usage.

### 3. Phase-Based Execution

Any logic that iterates over modules MUST respect the `PHASE_ORDER` defined in `ModuleDiscovery`.

```typescript
export type ModulePhase = 'core' | 'provider' | 'feature' | 'integration' | 'theme';

const PHASE_ORDER: Record<ModulePhase, number> = {
  core: 0,
  provider: 10,
  feature: 20,
  integration: 30,
  theme: 40,
};
```

---

## Instructions

### Adding a New Discovery Target

1.  **Identify the Target**: Determine if the new target is a configuration file (Node-based) or a code module (Vite-based).
2.  **Update `glob-helper.ts`**: For code/asset targets, add a new exported function with the appropriate glob pattern.
3.  **Update `ModuleDiscovery`**: For configuration or metadata targets, update the `loadModules()` loop to gather the new data from the filesystem.
4.  **Define Types**: Update the `ModuleConfig` or related interfaces to include the new data, ensuring `unknown` is used for dynamic properties.

---

## Templates & Examples

- **Template**: [New Discovery Utility](./templates/utility.ts.txt)
- **Template**: [Module Config](./templates/module.config.mjs.txt)
- **Example**: [Adding a Glob](./examples/glob-injection.ts.txt)
- **Example**: [Using ModuleDiscovery](./examples/load-modules-usage.ts.txt)
