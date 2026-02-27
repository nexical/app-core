---
title: Security & Auth
description: Middleware pipelines, RBAC, and ABAC patterns.
sidebar:
  order: 7
---

Nexical employs a "Defense in Depth" strategy using Chained Middleware and Policy-Based Access Control.

## Middleware Pipeline

The `src/middleware.ts` file acts as a host. It discovers middleware exports from all modules and chains them.

```ts
// modules/auth/src/middleware.ts
export default {
  // Bypass auth for these routes
  publicRoutes: ['/login', '/register'],

  onRequest: async (context, next) => {
    // Validation logic
    return next();
  },
};
```

## Role-Based Access Control (RBAC)

Basic role checks are handled via `ApiGuard` or `context.locals.actor`.

```ts
if (actor.role !== 'ADMIN') throw new Error('Forbidden');
```

## Attribute-Based Access Control (ABAC)

For finer granularity (e.g., "Can this user edit _this_ specific team?"), use the `RoleRegistry`.

```ts
await roleRegistry.check('team.owner', context, { teamId });
```
