import { test, expect } from '@tests/e2e/lib/fixtures';
import { hashPassword } from '@modules/user/tests/integration/factory';
import { LoginPage } from './pages/login-page';

test.describe('1.3 Login & Session', () => {
  test.describe.configure({ mode: 'serial' });

  test('Scenario A: Standard Login', async ({ actor, page }) => {
    const password = 'Password123!';
    const user = await actor.data.create('user', { password: hashPassword(password) });
    const loginPage = new LoginPage(page);

    await test.step('Navigate to login', async () => {
      await loginPage.visit();
    });

    await test.step('Enter credentials', async () => {
      const navPromise = page.waitForNavigation();
      await loginPage.login(user.email, password);
      await navPromise;
    });

    await test.step('Verify redirect to home', async () => {
      await expect(page).toHaveURL('/');
      await expect(page.getByTestId('user-menu-trigger')).toBeVisible();
    });
  });

  test('Scenario B: Login as Inactive User', async ({ actor, page }) => {
    const password = 'Password123!';
    const user = await actor.data.create('user', {
      password,
      status: 'INACTIVE',
    });
    const loginPage = new LoginPage(page);

    await loginPage.visit();
    await loginPage.login(user.email, password);

    await loginPage.expectError(/deactivated|error|deactivate|denied|invalid/i);
  });

  test('Scenario C: Invalid Credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.visit();
    await loginPage.login('nonexistent@example.com', 'WrongPass!');

    await loginPage.expectError(/invalid|error|credentials/i);
  });
});
