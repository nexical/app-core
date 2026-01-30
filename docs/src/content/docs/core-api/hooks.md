---
title: Event Bus (HookSystem)
description: Decoupling modules with cross-module events and filters.
sidebar:
  order: 1
---

The `HookSystem` is the primary mechanism for cross-module communication in the Nexical Ecosystem. It allows modules to publish events and subscribe to actions without direct coupling.

## API Reference

### `HookSystem.dispatch(event, data, context?)`

Fire and forget event. Useful for asynchronous side effects (e.g., sending an email after registration).

```ts
import { HookSystem } from '@/lib/modules/hooks';

// Dispatching an event
await HookSystem.dispatch('user.registered', { userId: '123' });
```

### `HookSystem.on(event, handler)`

Subscribe to an event. Handlers are executed in parallel when dispatched.

```ts
// Listening to an event
HookSystem.on('user.registered', async (data) => {
  console.log(`User registered: ${data.userId}`);
});
```

### `HookSystem.filter(event, data, context?)`

Pass data through a chain of listeners, allowing each to modify it. Useful for plugins that need to enrich data or enforce policy.

```ts
// Applying filters
const enrichedUser = await HookSystem.filter('user.view', userFromDb);
```

```ts
// Registering a filter
HookSystem.on('user.view', (user) => {
  return { ...user, canAccessPro: true };
});
```
