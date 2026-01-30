# Integration Testing Framework

This directory contains the Integration Testing Framework for ArcNexus. This framework is designed to provider a robust, developer-friendly way to test API endpoints via real HTTP calls while allowing direct database manipulation for efficient state setup.

## Philosophy

- **"Black Box" API Testing**: valid HTTP requests are sent to a running instance of the application. We test the public interface (API endpoints).
- **"White Box" Data Setup**: We use direct database access (via Prisma) to seed data (`User`, `Team`, etc.) and to verify side-effects (e.g. checking if a record was created). This avoids the flakiness and slowness of relying solely on the API for setup.

## Directory Structure

- `lib/`: Core libraries.
  - `server.ts`: Manages the Astro dev server lifecycle.
  - `client.ts`: A smart HTTP client that handles cookies/sessions.
  - `factory.ts`: A generic data factory for DB seeding.
- `api/`: Integration tests for API endpoints.
- `setup.ts`: Global Vitest setup (boots server, cleans DB).

## How to Write Integration Tests

### 1. Create a Test File

Create a file in `tests/integration/api/` (or strictly `tests/integration` subfolders).
Example: `tests/integration/api/teams.test.ts`.

### 2. Import Utilities

```typescript
import { describe, it, expect } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { Factory } from '@tests/integration/lib/factory';
import { TestServer } from '@tests/integration/lib/server';
```

### 3. Use `ApiClient` with Actors (Recommended)

Instantiate the client with the server URL. Use the fluent `.as()` API to create and authenticate as various actor types (Users, Teams/Tokens, etc.) defined across your modules.

```typescript
const client = new ApiClient(TestServer.getUrl());

// Authenticate as a user (creates user + logs in via session automatically)
await client.as('user', { role: 'ADMIN', name: 'Alice' });

// Authenticated request
const response = await client.get('/api/users');
expect(response.status).toBe(200);

// Switch to a different actor fluently
await client.as('user', { email: 'bob@example.com' });
const bobRes = await client.get('/api/users');
expect(bobRes.status).toBe(403);
```

The `.as(type, params)` system is modular: it discovers "actor providers" defined in each module's `tests/integration/actors.ts` file.

### 4. Use `DataFactory` for Setup

Use `Factory` to create the state you need _before_ the API call. The factory dynamically loads definitions from each module's `tests/integration/factory.ts`.

```typescript
import { hashPassword } from '@/modules/user/tests/integration/factory';

// Create a user directly in DB
// Note: hashPassword is imported from the user module factory, not the core Factory
const user = await Factory.create('user', {
  email: 'test@example.com',
  password: hashPassword('password'),
  name: 'Test User',
});

// Create a team owned by that user
const team = await Factory.create('team', {
  name: 'Integration Team',
  members: {
    create: {
      userId: user.id,
      role: 'OWNER',
    },
  },
});
```

### 5. Run the Tests

Tests run via Vitest using the integration config.

```bash
# Run all integration tests
npm run test:integration

# Run a specific test file
npm run test:integration tests/integration/api/teams.test.ts
```

## Extending the Framework (Modular Factories)

The framework is designed to be modular. Each module can define its own factory logic for creating entities.

### Creating a Module Factory

1. Create a `factory.ts` file in your module's `tests/integration/` directory (e.g., `modules/my-module/tests/integration/factory.ts`).
2. Export a `factories` object containing builder functions for your models.

```typescript
// modules/my-module/tests/integration/factory.ts
import crypto from 'node:crypto';

export const factories = {
  // Corresponds to 'myModel' in Factory.create('myModel', ...)
  myModel: (index: number) => {
    return {
      name: `Default Name ${index}`,
      slug: `slug-${crypto.randomUUID()}`,
      // ... other default fields
    };
  },
};

// You can also export helper functions specific to your module
export function myHelper() {
  // ...
}
```

This allows the core `DataFactory` to discover and use your factory definitions without hardcoding module knowledge in the core library.

## Testing with Actors (Actor Registry)

Just like the `DataFactory`, the `ApiClient` uses a discovery mechanism to load actor profiles from modules.

### Creating a Module Actor Provider

1. Create an `actors.ts` file in your module's `tests/integration/` directory.
2. Export an `actors` object containing provider functions.

```typescript
// modules/team/tests/integration/actors.ts
export const actors = {
  // client.as('team', { teamId: '...' })
  team: async (client: ApiClient, params: any) => {
    const team = params.team || (await Factory.create('team', params));
    // Custom logic to authenticate as this team (e.g. use an API Key)
    const key = await createKey(team.id);
    client.useToken(key.raw);
    return team;
  },
};
```

### Context Management

- **`client.as(type, params)`**: Switches the client to a specific actor context. This handles setup and authentication in one call.
- **`client.useToken(token)`**: Manually sets a Bearer token.
- **`client.useSession()`**: Clears the token and reverts to session cookies.
- **`client.clearAuth()`**: Clears both tokens and session cookies (logout).

## Examples

```typescript
it('should logout successfully', async () => {
  // 1. Authenticate as actor
  await client.as('user', { email: 'alice@example.com' });

  // 2. Action
  const res = await client.post('/api/logout');

  // 3. Assertion
  expect(res.status).toBe(200);
});
```

```typescript
it('should list teams for authenticated user', async () => {
  // 1. Authenticate as a user with a team membership
  const team = await Factory.create('team', { name: 'My Team' });
  await client.as('user', {
    teams: { create: { teamId: team.id, role: 'OWNER' } },
  });

  // 2. Action
  const res = await client.get('/api/teams');

  // 3. Verify
  expect(res.body).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'My Team' })]));
});
```
