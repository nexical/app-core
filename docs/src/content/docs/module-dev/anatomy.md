---
title: Module Anatomy
description: detailed guide to the structure of a Nexical module.
sidebar:
  order: 2
---

A standard module follows a strict directory structure to ensure the build system can discover its features.

## Directory Structure

```text
modules/{name}/
├── api.yaml              # API definitions (OpenAPI)
├── models.yaml           # Database schema extensions
├── package.json          # Dependency management
├── src/
│   ├── actions/          # Business logic controllers
│   ├── agent/            # Background job processors
│   ├── components/       # Internal React components
│   ├── emails/           # Transactional email templates
│   ├── pages/            # Astro/API routes
│   ├── registry/         # UI Injection points
│   ├── services/         # Domain logic & DB access
│   └── styles/           # Tailwind CSS layers
└── styles.css            # Module-specific styles
```

## Middleware and Security

Export a default object from `src/middleware.ts` to define security logic:

```ts
export default {
  publicRoutes: ['/login'],
  onRequest: async (context, next) => {
    // Custom logic
    return next();
  },
};
```

## Cross-Module Events

Use the **Hook System** to decouple features.

- **Listen**: `HookSystem.on('user.registered', callback)`
- **Dispatch**: `HookSystem.dispatch('user.registered', data)`
