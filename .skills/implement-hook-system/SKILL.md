---
name: implement-hook-system
description: 'This skill defines the authoritative patterns for implementing event-driven architectures and cross-module communication within the Nexical Ecosystem.'
---

# Skill: Implement Hook System

This skill defines the authoritative patterns for implementing event-driven architectures and cross-module communication within the Nexical Ecosystem.

## 1. Core Principles

- **Agnostic Core**: The core system must never have direct knowledge of the modules listening to its events.
- **Resilience**: A failure in one listener must never crash the entire process.
- **Type Safety**: All event payloads and contexts must be strictly typed using generics; the `any` type is strictly forbidden.
- **Priority**: Selection and execution logic MUST follow a **Last-In-First-Out (LIFO)** pattern, ensuring the most recently registered modules can override or modify core behavior.

## 2. Implementation Patterns

### Class-Based Static Registry

Registries MUST be implemented as classes using static methods and private static `Map` storage. This ensures O(1) lookups and prevents instance-related overhead in the core infrastructure.

**Mandatory Private Constructor**: Static utility classes MUST include a `private constructor() {}` to prevent accidental instantiation.

### Normalized Handler Storage

To store handlers for diverse event types in a single `Map`, you MUST normalize their signatures.

1.  **Define a Normalized Type**: Create a type alias that accepts `unknown` arguments and returns `unknown`.
    ```typescript
    type NormalizedHandler = (data: unknown, context?: unknown) => unknown | Promise<unknown>;
    ```
2.  **Cast on Registration**: Inside the `on` method, cast the strongly-typed generic handler to the normalized signature `(data: unknown, context?: unknown) => unknown` before storage. This satisfies the internal Map's type constraints while maintaining external type safety.

### LIFO Registration (Priority)

Handlers MUST be added to the start of the array using `unshift()` (or the iteration logic MUST be reversed) to ensure that the most recently registered listeners execute first. This allows modules to "hook" into processes and modify data before earlier listeners or the core system processes it.

### Asynchronous Event Dispatch (Fire-and-Forget)

Use `dispatch` for parallel, non-blocking side-effects where the return value is ignored by the caller. Side-effects are triggered in parallel using `Promise.allSettled` to ensure all listeners execute regardless of individual failures.

### Sequential Data Filtering (Pipeline)

Use `filter` for serial data transformations where the output of one handler becomes the input of the next. This is used for modifying payloads before they reach their final destination.

**Filter Opt-out**: Handlers in a `filter` pipeline SHOULD return `undefined` (or no value) if they do not wish to modify the data. The pipeline logic (`if (result !== undefined)`) ensures the previous value is preserved.

## 3. Mandatory Rules

1.  **Generics Requirement**: All hook signatures MUST use generics for the payload (`T`) and the optional context (`C`).
2.  **Generic Defaulting**: Both generics MUST default to `unknown` (e.g., `<T = unknown, C = unknown>`) to maintain agnostic core integrity.
3.  **Error Isolation**: Every external handler execution MUST be wrapped in a `try-catch` block to preserve system stability.
4.  **Zero-Tolerance for `any`**: The `any` type is forbidden. Use specific interfaces or constrained generics.
5.  **Functional Signature Normalization**: Cast external generic handlers to a normalized `(data: unknown, context?: unknown) => unknown` signature for internal storage.
6.  **Static Constraints**: Use private static members and a **private constructor** for all infrastructure utilities.

## 4. Hook Signatures

```typescript
/**
 * Register a listener for an event.
 * Uses unshift() to ensure LIFO priority.
 */
static on<T = unknown, C = unknown>(
  event: string,
  handler: (data: T, context?: C) => void | T | Promise<void | T>
): void;

/**
 * Dispatch an event (Parallel/Side-effects).
 * Fire-and-forget using Promise.allSettled.
 */
static async dispatch<T = unknown, C = unknown>(
  event: string,
  data: T,
  context?: C
): Promise<void>;

/**
 * Filter data through a pipeline (Sequential/Transformation).
 * Serial execution following LIFO order.
 */
static async filter<T = unknown, C = unknown>(
  event: string,
  data: T,
  context?: C
): Promise<T>;
```
