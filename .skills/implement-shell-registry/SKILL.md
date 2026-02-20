# Skill: Implement Shell Registry

This skill guides the implementation of context-aware registries within the Nexical Ecosystem. Registries are the backbone of the "Shell-Registry" pattern, allowing modules to "pin" functionality or content into specific "Zones" of the shell.

## 1. Core Principles

- **Modular Monolith**: Registries enable an "Agnostic Core" where the shell doesn't know what's installed; it only renders what's in the registry.
- **LIFO Selection**: Selection logic always prioritizes the most recently registered item (Last-In-First-Out).
- **Insertion Order**: Registry entries are stored in a `Map` to preserve insertion order, which is critical for LIFO iteration.

---

## 2. Mandatory Patterns

### A. Singleton Registry Class

Registries MUST be implemented as classes with private `Map` storage and exported as a single named constant instance. This ensures a global singleton state and preserves the insertion order required for LIFO selection.

**Rule**: Always export a singleton instance. Do NOT use `static` methods for state management.
**Anti-Pattern**: NEVER instantiate a registry class outside of its definition file. Direct instantiation breaks the singleton state.

### B. Delete-Set Reordering (LIFO Priority)

To support overriding with priority while maintaining insertion-order iteration, existing entries MUST be deleted before being re-set. This moves the entry to the "end" of the Map, giving it the highest priority during LIFO selection.

```typescript
if (this.registry.has(name)) {
  this.registry.delete(name);
}
this.registry.set(name, entry);
```

### C. Context-Bound Selection

Registry selection MUST be driven by a strongly-typed `Context` object (e.g., `ShellContext`) representing the current environment (URL, device, viewport).

**Rule**: Never use `any` for selection context. Use `Record<string, unknown>` for dynamic data like `navData`.

### D. Polymorphic Matchers

Registries use flexible "Matchers" that can be either predicate functions or string patterns (globs).

```typescript
export type ShellMatcher = string | ((context: ShellContext) => boolean);
```

### E. LIFO (Reverse) Selection Logic

Selection logic MUST iterate through registry entries in reverse order (last to first). The first entry to satisfy the matcher wins. This ensures that the most recently registered component for a given condition takes precedence.

---

## 3. Implementation Workflow

1.  **Define the Context**: Create a strongly-typed interface for the environment data required for selection.
2.  **Define the Entry Interface**: Define what data (components, metadata) is being stored in the registry.
3.  **Implement the Registry Class**:
    - Location: `core/src/lib/registries/`
    - Naming: `*-registry.ts`
    - Use a private `Map<string, Entry>` for storage to preserve insertion order.
    - Implement a `register` method with Delete-Set reordering.
    - Implement a `select` method (MANDATORY NAME) using reverse iteration and polymorphic matching.
4.  **Export a Singleton Instance**.
5.  **Initialize**: Ensure the registry is imported in `core/src/init.ts` to be globally available during the platform boot sequence.

---

## 4. Selection Criteria (Glob Matching)

Implement lightweight, manual path matching for the following patterns within the registry class to minimize external dependencies and maximize performance:

- `/*` (Prefix matching)
- `*` (Match all)
- Exact matches

---

## 5. Templates & Examples

- **Templates**:
  - `templates/registry-class.ts`: Boilerplate for a new registry class.
  - `templates/registry-entry.ts`: Interface definitions.
- **Examples**:
  - `examples/shell-registry-implementation.ts`: A complete implementation of the `ShellRegistryClass`.
  - `examples/context-aware-matching.ts`: Selection using a `ShellContext`.
