# Skill: Use Hook System

This skill provides procedural guidance for developers to consume the Hook System for cross-module communication, ensuring loose coupling and type-safe interactions.

## 1. Core Concepts

The Hook System is a global, agnostic event bus. It allows modules to interact with each other without direct imports, preserving the **Agnostic Core** mandate.

### Dispatch vs. Filter

- **`dispatch` (Side-Effects)**: Use this to announce an event. Multiple listeners run in **parallel**. It is fire-and-forget; the caller does not wait for a return value. Use this for things like sending emails, logging, or updating external systems.
- **`filter` (Transformations)**: Use this to modify data. Listeners run **sequentially** in a pipeline. Each listener receives the output of the previous one. Use this for enriching objects, applying permissions, or altering query results.

## 2. Mandatory Usage Rules

1.  **Strict Type Safety**: You MUST define interfaces for payloads and contexts. The `any` type is strictly forbidden.
2.  **Context Awareness**: Use the generic context parameter `C` (which defaults to `unknown`) to pass request-level metadata (e.g., current user, request ID).
3.  **Filter Opt-out**: If a filter handler does not need to modify the data, it MUST return `undefined` (or nothing) to allow the pipeline to continue with the current value.
4.  **Async Resilience**: While the system isolates errors, handlers SHOULD still manage their own internal errors to avoid unnecessary system-level logging.

## 3. Implementation Patterns

### Subscribing to an Event (Side-Effect)

```typescript
import { HookSystem } from '@/lib/modules/hooks';

interface UserRegisteredPayload {
  userId: string;
  email: string;
}

// Subscribe in a module's server-init.ts or a dedicated hooks file
HookSystem.on<UserRegisteredPayload>('user.registered', async (data, context) => {
  // context is unknown by default
  await sendWelcomeEmail(data.email);
});
```

### Subscribing to a Filter (Transformation)

```typescript
import { HookSystem } from '@/lib/modules/hooks';

interface UserData {
  id: string;
  role: string;
  isVip?: boolean;
}

HookSystem.on<UserData>('user.read', async (user, context) => {
  if (user.role === 'ADMIN') {
    return { ...user, isVip: true };
  }
  // Returning undefined tells the HookSystem to keep the current user object
  return undefined;
});
```

### Dispatching an Event

```typescript
await HookSystem.dispatch<UserRegisteredPayload, { source: string }>(
  'user.registered',
  { userId: '123', email: 'test@example.com' },
  { source: 'web-signup' },
);
```

### Applying a Filter

```typescript
const rawUser = { id: '123', role: 'ADMIN' };
const enrichedUser = await HookSystem.filter<UserData>('user.read', rawUser);
// enrichedUser.isVip will be true if a listener modified it
```

## 4. Troubleshooting

- **Event Not Firing**: Ensure your listener is registered during the `server-init.ts` phase of your module.
- **Data Not Modifying**: In a `filter`, ensure you are actually returning the modified object. If you return `undefined`, the data remains unchanged.
- **Type Errors**: Ensure the generic `T` matches between `on` and `dispatch`/`filter`.
