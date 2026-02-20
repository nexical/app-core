# Skill: Consume API SDK

This skill provides expert guidance on interacting with the Nexical Ecosystem's centralized API client and federated SDKs.

## 1. The Centralized API Mandate

**CRITICAL**: All API requests and type references MUST be routed through the centralized `api` singleton. Direct imports from module-specific SDKs (e.g., `@modules/user/src/sdk`) are **STRICTLY FORBIDDEN**.

- **Methods**: Access via `api.{module}.{method}()`.
- **Types**: Access via `*ModuleTypes` namespaces (e.g., `UserModuleTypes.User`).

### Mandatory Import Whitespace

A **SINGLE SPACE** is mandatory after the opening quote for all internal aliases and workspace packages.

- **CORRECT**: `import { api } from ' @/lib/api';`
- **INCORRECT**: `import { api } from '@/lib/api';`

## 2. Using the Federated SDK

The `api` object is an aggregated client that provides a type-safe interface for all installed modules.

```typescript
import { api } from ' @/lib/api';
import type { UserModuleTypes } from ' @/lib/api';

/**
 * Example: Fetching a user by ID
 */
export async function getUserProfile(id: string): Promise<UserModuleTypes.User | null> {
  const response = await api.user.getUser({ id });

  // ALWAYS check the success flag
  if (!response.success) {
    console.error(`Failed to fetch user: ${response.error}`);
    return null;
  }

  return response.data;
}
```

## 3. Standardized Error Handling

All SDK methods return a `ServiceResponse<T>`. When an error occurs, the response adheres to the `ApiError` interface.

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

### Pattern: Error Mapping

```typescript
const { success, error, status } = await api.billing.createInvoice(data);

if (!success) {
  if (status === 402) {
    // Handle Payment Required
  }
  throw new Error(error || 'An unexpected error occurred');
}
```

## 4. Browser Debugging

In browser environments, the `api` singleton is attached to `window.api`. This allows for interactive debugging and manual testing via the browser console.

```javascript
// From browser console:
await window.api.user.listUsers();
```

## 5. Isomorphic Execution

The API client automatically detects its environment:

- **Client-side**: Uses relative paths (e.g., `/api`).
- **Server-side**: Uses absolute URLs derived from `PUBLIC_SITE_URL` or `localhost:4321`.

This ensures that the same SDK code works seamlessly during SSR (Astro) and on the client.
