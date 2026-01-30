---
title: Integration Testing
description: The "Black Box API / White Box Data" testing framework.
sidebar:
  order: 5
---

The Integration Testing Framework is designed for robust API testing with efficient data setup.

## Philosophy

- **"Black Box" API Testing**: We test the public interface (API endpoints) by sending real HTTP requests.
- **"White Box" Data Setup**: We use direct database access (via Prisma) to seed data. This avoids the slowness of utilizing the API for setup.

## Writing Tests

### 1. Structure

Tests live in `tests/integration/api/`.

```ts
import { describe, it, expect } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { Factory } from '@tests/integration/lib/factory';
import { TestServer } from '@tests/integration/lib/server';
```

### 2. The `ApiClient` & Actors

Use the `.as()` method to switch contexts fluently.

```ts
const client = new ApiClient(TestServer.getUrl());

// Authenticate as a user (creates user + logs in via session automatically)
await client.as('user', { role: 'ADMIN', name: 'Alice' });

const response = await client.get('/api/users');
expect(response.status).toBe(200);
```

### 3. The `DataFactory`

Use `Factory` to create state directly in the DB.

```ts
const team = await Factory.create('team', {
  name: 'Integration Team',
  members: {
    create: { userId: user.id, role: 'OWNER' },
  },
});
```

## Running Tests

```bash
# Run all
npm run test:integration

# Run specific
npm run test:integration tests/integration/api/teams.test.ts
```
