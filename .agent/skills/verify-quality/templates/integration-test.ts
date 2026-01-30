import { describe, it, expect, beforeAll } from 'vitest';
import { ApiClient } from ' @tests/integration/lib/client';
import { TestServer } from ' @tests/integration/lib/server';
import { Factory } from ' @tests/integration/lib/factory';

describe('My Feature API', () => {
  let client: ApiClient;

  beforeAll(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  it('should create a resource and trigger side effects', async () => {
    // 1. Arrange: Create Prerequisites (White Box)
    const user = await Factory.create('user', { role: 'MEMBER' });

    // 2. Act: Call API (Black Box)
    const response = await client.as(user).post('/api/my-feature', {
      name: 'New Item',
    });

    // 3. Assert: Check Response
    expect(response.status).toBe(200);
    expect(response.data.name).toBe('New Item');

    // 4. Assert: Check Side Effects (White Box)
    // Codebase uses Factory.prisma.{model}.findUnique()
    const dbItem = await Factory.prisma.myFeature.findUnique({
      where: { id: response.data.id },
    });
    expect(dbItem).toBeDefined();

    // 5. Assert: Check Hook System Side Effects (e.g., Audit Log created via hook)
    const auditLog = await Factory.prisma.auditLog.findFirst({
      where: { entityId: response.data.id },
    });
    expect(auditLog).toBeDefined();
    expect(auditLog?.action).toBe('CREATE');
  });

  it('should block unauthorized access (ApiGuard)', async () => {
    // 1. Arrange: User with insufficient permissions
    const guest = await Factory.create('user', { role: 'GUEST' });

    // 2. Act: Attempt restricted action
    const response = await client.as(guest).post('/api/my-feature', {
      name: 'Unauthorized Item',
    });

    // 3. Assert: Expect 403 Forbidden
    expect(response.status).toBe(403);
  });
});
