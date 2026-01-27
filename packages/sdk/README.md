# @nexical/sdk

This is the auto-generated Federated SDK for ArcNexus. It provides a unified client for accessing all module APIs.

## Usage

### Frontend
```typescript
import { api } from '@/lib/api';

// Access module SDKs
const users = await api.user.list();
```

### Adding a New Module

To expose your module's API through the SDK, follow these steps:

1.  **Create SDK Entry Point**: Create `src/sdk/index.ts` inside your module (e.g., `modules/my-module/src/sdk/index.ts`).
2.  **Inherit BaseResource**: Export a class that extends `BaseResource` from `@nexical/sdk-core`.
3.  **Naming Convention**: The class **MUST** be named `{ModuleName}SDK` (PascalCase). For example, if your module is `modules/team`, the class must be `TeamSDK`.
4.  **Auto-Discovery**: Run `npm run gen:sdk` (or restart the dev server) to auto-discover your new SDK module.

### Example

```typescript
// modules/team/src/sdk/index.ts
import { BaseResource } from '@nexical/sdk-core';

export class TeamSDK extends BaseResource {
  async list() {
    return this.request('GET', '/teams');
  }

  async create(data: { name: string }) {
    return this.request('POST', '/teams', data);
  }
}
```

### Type Safety
Import DTOs directly from your module's source (e.g., `../types`) to ensure strong typing in your SDK methods.
