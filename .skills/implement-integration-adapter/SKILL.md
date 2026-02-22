# Skill: Implement Integration Adapter

## Role

This skill guides the creation of **Core Astro Integrations**. These are the "Machinery" of the Modular Monolith, responsible for gluing the separate modules together at build time. They operate outside of the standard application runtime, executing during the Astro build/dev lifecycle.

## Mandatory Patterns

### 1. The Factory Pattern

Integrations MUST be exported as a default factory function that returns the `AstroIntegration` interface.

```typescript
// core/src/lib/integrations/my-integration.ts
import type { AstroIntegration } from 'astro';

export default (): AstroIntegration => ({
  name: 'my-integration',
  hooks: { ... }
});
```

### 2. Strict Naming Convention

- **Filename**: MUST end in `-integration.ts` (e.g., `module-styles-integration.ts`).
- **Internal Name**: The `name` property returned in the object MUST match the feature name (e.g., `module-styles`).

### 3. Node.js Standard Library Imports

Because integrations run in the Node.js environment (not the browser), you MUST use the `node:` prefix for all built-in modules to ensure clarity and avoid conflicts.

```typescript
// BAD
import fs from 'fs';
import path from 'path';

// GOOD
import fs from 'node:fs';
import path from 'node:path';
```

## Implementation Details

### Dynamic Module Discovery

Integrations must never hardcode paths to specific modules. They must dynamically discover assets by scanning the filesystem.

- **Root Resolution**: Always resolve paths relative to `process.cwd()`.
- **Iteration**: Use `fs.readdirSync` to iterate over `apps/backend/modules` or `apps/frontend/modules`.

```typescript
const MODULES_DIR = path.join(process.cwd(), 'apps/frontend/modules');
const modules = fs
  .readdirSync(MODULES_DIR)
  .filter((f) => fs.statSync(path.join(MODULES_DIR, f)).isDirectory());
```

### Client-Side Injection

To make assets (like CSS or global scripts) available to the browser, use the `injectScript` hook method.

- **Stage**: Usually `'page'` for global availability.

```typescript
injectScript('page', `import "@/styles/global.css";`);
```

### Prefixed Logging

Build output can be noisy. Always prefix your logs with the integration name to help developers debug.

```typescript
console.info(`[my-integration] Found ${count} modules.`);
```
