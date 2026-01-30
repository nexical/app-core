/* eslint-disable */
import { test, expect } from '@tests/e2e/lib/fixtures';

test.describe('2.2 Manage Sessions', () => {
  test('Scenario A: List Sessions (API)', async ({ actor, page }) => {
    const user = await actor.as('user');

    // Since UI is missing in registry, we verify via API as per spec "Fetch sessions from ..."
    const response = await page.request.get('/api/users/me/sessions');
    expect(response.ok()).toBeTruthy();
    const sessions = await response.json();
    expect(Array.isArray(sessions)).toBeTruthy();
    expect(sessions.length).toBeGreaterThan(0); // Current session
  });

  test('Scenario B: Revoke Session (API)', async ({ actor, page, baseURL }) => {
    await actor.as('user');

    // 1. Get current sessions
    const listRes = await page.request.get('/api/users/me/sessions');
    expect(listRes.ok(), `GET /api/users/me/sessions failed: ${listRes.status()}`).toBeTruthy();
    const sessions = await listRes.json();
    const currentSession = sessions[0];

    if (currentSession?.id) {
      const url = `/api/users/me/sessions/${currentSession.id}`;
      // IMPORTANT: Direct API requests for mutations (DELETE, POST, etc.)
      // from page.request need Origin header for Astro's CSRF protection.
      const deleteRes = await page.request.delete(url, {
        headers: {
          Origin: baseURL || '',
        },
      });

      if (!deleteRes.ok()) {
        const body = await deleteRes.text();
        throw new Error(`DELETE ${url} failed with status ${deleteRes.status()}: ${body}`);
      }
      expect(deleteRes.ok()).toBeTruthy();

      // 3. Verify session is gone
      const listRes2 = await page.request.get('/api/users/me/sessions');
      if (listRes2.status() === 401) {
        expect(true).toBe(true);
      } else {
        const sessions2 = await listRes2.json();
        expect(sessions2.find((s: any) => s.id === currentSession.id)).toBeUndefined();
      }
    } else {
      throw new Error('No session found to revoke');
    }
  });
});
