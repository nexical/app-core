import { describe, it, expect, beforeAll } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { Factory } from '@tests/integration/lib/factory';

describe('User Module: Profile API', () => {
  let client: ApiClient;

  beforeAll(() => {
    client = new ApiClient();
  });

  it('should return the current user profile when authenticated', async () => {
    // 1. Setup Data: Create a user directly in the database
    const email = 'test-user @example.com';
    await Factory.create('user', { email, name: 'Test User' });

    // 2. Auth: Act as the newly created user
    await client.as('user', { email });

    // 3. Act: Call the profile endpoint
    const res = await client.get('/api/user/profile');

    // 4. Assert: Status code MUST be checked first
    expect(res.status).toBe(200);

    // 5. Assert: Verify the response body content
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(email);
    expect(res.body.data.name).toBe('Test User');
  });

  it('should return 401 when accessing profile without authentication', async () => {
    // Act: Ensure we are not authenticated
    client.logout();

    const res = await client.get('/api/user/profile');

    // Assert: Check for unauthorized status
    expect(res.status).toBe(401);
  });
});
