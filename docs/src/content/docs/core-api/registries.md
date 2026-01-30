---
title: Registries
description: Understanding the dynamic registration patterns.
sidebar:
  order: 2
---

Registries allow modules to provide functionality to the core platform dynamically.

## ShellRegistry

The `ShellRegistry` determines which "App Shell" to render for a given request. This allows modules to completely takeover the UI (e.g., Kiosk Mode, Admin Panel).

### `ShellRegistry.register(name, component, matcher)`

- **matcher**: A string glob (e.g., `/admin/*`) or a predicate function `(ctx) => boolean`.

```ts
import { ShellRegistry } from '@/lib/registries/shell-registry';
import AdminShell from './AdminShell';

ShellRegistry.register('admin', AdminShell, (ctx) => ctx.url.pathname.startsWith('/admin'));
```

## RoleRegistry

The `RoleRegistry` defines authorization policies for different roles.

### `RoleRegistry.register(name, policy)`

```ts
import { RoleRegistry } from '@/lib/registries/role-registry';

RoleRegistry.register('admin', {
  check: async (ctx, input) => {
    if (ctx.locals.user.role !== 'ADMIN') throw new Error('Unauthorized');
  },
});
```
