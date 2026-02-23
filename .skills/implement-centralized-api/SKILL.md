---
name: implement-centralized-api
description: 'This skill defines the authoritative pattern for the **Centralized API Client** within the Nexical Ecosystem. Every SDK method and type MUST be routed through this central point to ensure architectura...'
---

# Skill: Implement Centralized API

This skill defines the authoritative pattern for the **Centralized API Client** within the Nexical Ecosystem. Every SDK method and type MUST be routed through this central point to ensure architectural consistency, uniform error handling, and developer discoverability.

## Core Mandates

1.  **Centralized Aggregator**: Export a single, global `api` object from `core/src/lib/api/api.ts` that acts as an aggregator for the core client and all module extensions.
2.  **Prototype Preservation**: You MUST use `Object.assign(client, { ... })` (or similar prototype-preserving mechanism) to create the `api` object. Do NOT use object spread syntax (`{ ...client }`) as it strips class prototype methods.
3.  **Modular SDK Aggregation**: The central `api` object MUST aggregate all module-specific SDKs (e.g., `api.user`, `api.billing`).
4.  **Namespace-Based Types**: Export aggregated module types using the `*ModuleTypes` naming convention (e.g., `UserModuleTypes`).
5.  **Environment Awareness**: Dynamically calculate the `baseUrl` based on the execution context (Browser vs. Server).
6.  **Strict Import Formatting**: **NEVER** insert a space before the `@` symbol in import paths. (e.g., use `'@nexical/sdk'`, NOT `' @nexical/sdk'`).
7.  **Zero-Tolerance for `any`**: All error interfaces and client extensions must be strictly typed.
8.  **ServiceResponse Enforcement**: All aggregated SDK methods MUST return a `ServiceResponse<T>` as defined in `CODE.md`.

## Architecture: The Aggregator Pattern

To maintain **Core Neutrality** while enabling modular feature growth, the centralized API client acts as a "Shell" (Aggregator) that wraps the base `NexicalClient` and is populated by module extensions.

### 1. The Federated SDK

Each module generates its own SDK client via `nexical gen api {module}`. This client is exported from `@core/src/lib/modules/hooks.ts{module}/src/sdk/index.ts`.

### 2. The Central Hub (`api.ts`)

The central hub imports these individual SDKs and merges them into the global `api` object. This file is a **Generator Target**.

```typescript
// core/src/lib/api/api.ts
import { NexicalClient } from '@nexical/sdk';
import { UserSDK } from '@modules/user/src/sdk';

// Base client instance
const client = new NexicalClient({ baseUrl });

/**
 * CENTRALIZED API AGGREGATOR
 * All SDK access (methods and types) MUST be routed through this object.
 * Modules register themselves here during generation.
 *
 * NOTE: We use Object.assign to preserve the 'client' prototype methods (get, post, etc.)
 * while appending the module SDKs.
 */
export const api = Object.assign(client, {
  user: new UserSDK(client),
  // [GENERATOR: MODULES_START]
  // [GENERATOR: MODULES_END]
});
```

### 3. Automation & Maintenance

The `api.ts` file contains generator markers (`[GENERATOR: MODULES_START]`). The CLI uses these markers to automatically inject new module SDKs when they are created. **DO NOT REMOVE THESE MARKERS.**

## Patterns

### Environment-Aware Base URL

Use relative paths for browser-based requests to ensure they go through the application's middleware (proxy), and absolute URLs for server-side requests. Server-side execution requires the `PUBLIC_SITE_URL` environment variable.

```typescript
const baseUrl =
  typeof window !== 'undefined'
    ? '/api'
    : (process.env.PUBLIC_SITE_URL || 'http://localhost:4321') + '/api';
```

### Platform Debugging Hook

Always attach the `api` instance to the `window` object in development/browser environments to facilitate rapid debugging.

```typescript
if (typeof window !== 'undefined') {
  (window as unknown as { api: typeof api }).api = api;
}
```

### Strongly-Typed Error Interfaces

Define a standard `ApiError` interface to ensure predictable error handling across the entire ecosystem.

**Note:** While `ApiError` defines the structure of the error response body from the server, client-side SDKs MUST wrap these in a `NexicalError` instance. This class provides a consistent interface for the application to handle failures, regardless of the underlying transport issue.

```typescript
export interface ApiError {
  body?: {
    error?: string;
    message?: string;
  };
  message?: string;
  status?: number;
}
```

## Verification Checklist

- [ ] Does `api.ts` export a single global `api` object?
- [ ] Is `Object.assign` used to preserve client methods? (NO object spread `{...client}`)
- [ ] Are all internal imports correct (NO spaces before `@`)?
- [ ] Is `baseUrl` correctly handling Browser vs. Server context?
- [ ] Are module SDKs aggregated into the `api` object?
- [ ] Are the `[GENERATOR: ...]` markers present and intact?
- [ ] Is the `any` type completely absent?
- [ ] Does server-side initialization log the configuration using `console.info`?
