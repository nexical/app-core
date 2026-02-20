# Skill: Implement Hook System

This skill defines the authoritative patterns for implementing event-driven architectures and cross-module communication within the Nexical Ecosystem.

## 1. Core Principles

- **Agnostic Core**: The core system must never have direct knowledge of the modules listening to its events.
- **Resilience**: A failure in one listener must never crash the entire process.
- **Type Safety**: All event payloads and contexts must be strictly typed using generics; the `any` type is strictly forbidden.

## 2. Implementation Patterns

### Class-Based Static Registry

Registries MUST be implemented as classes using static methods and private static `Map` storage. This ensures O(1) lookups and prevents instance-related overhead in the core infrastructure.

### Asynchronous Event Dispatch (Fire-and-Forget)

Use `dispatch` for parallel, non-blocking side-effects where the return value is ignored by the caller. Side-effects are triggered in parallel using `Promise.allSettled` to ensure all listeners execute regardless of individual failures.

### Sequential Data Filtering (Pipeline)

Use `filter` for serial data transformations where the output of one handler becomes the input of the next. This is used for modifying payloads before they reach their final destination.

## 3. Mandatory Rules

1.  **Generics Requirement**: All hook signatures MUST use generics for the payload (`T`) and the optional context (`C`).
2.  **Context Defaulting**: The context generic `C` MUST default to `unknown` to maintain core neutrality.
3.  **Error Isolation**: Every external handler execution MUST be wrapped in a `try-catch` block to preserve system stability.
4.  **Zero-Tolerance for `any`**: The `any` type is forbidden. Use specific interfaces or constrained generics.

## 4. Hook Signatures

```typescript
/**
 * Register a listener for an event.
 */
static on<T, C = unknown>(
  event: string,
  handler: (data: T, context?: C) => void | T | Promise<void | T>
): void;

/**
 * Dispatch an event (Parallel/Side-effects).
 */
static async dispatch<T, C = unknown>(
  event: string,
  data: T,
  context?: C
): Promise<void>;

/**
 * Filter data through a pipeline (Sequential/Transformation).
 */
static async filter<T, C = unknown>(
  event: string,
  data: T,
  context?: C
): Promise<T>;
```
