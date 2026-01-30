import { test, expect } from '@tests/e2e/lib/fixtures';

test.describe('My Feature UI', () => {
  test('should allow user to interact', async ({ actor, page }) => {
    // 1. Login instantly
    await actor.as('user', { role: 'MEMBER' }, { gotoRoot: true });

    // 2. Navigate
    await page.goto('/my-feature');

    // 3. Interact (Use data-testid)
    await page.getByTestId('feature-create-btn').click();
    await page.getByTestId('feature-name-input').fill('New Item');
    await page.getByTestId('feature-submit-btn').click();

    // 4. Verify
    await expect(page.getByTestId('feature-list-item')).toContainText('New Item');
  });
});
