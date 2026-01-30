import { test, expect } from './lib/fixtures';
import { BasePage } from './lib/page';

class SanityPage extends BasePage {
  async visit() {
    await this.safeGoto('/login');
  }
  async verifyLoaded() {
    await expect(this.byTestId('login-submit')).toBeVisible();
  }
}

test.describe('E2E Framework Sanity', () => {
  test('Utils: Unique data generation', async ({ utils }) => {
    const email = utils.uniqueEmail();
    const username = utils.uniqueUsername();

    expect(email).toContain('@example.com');
    expect(username).toMatch(/^[a-z0-9_]+$/);
  });

  test('Actor: Auth and Navigation', async ({ actor, page }) => {
    // Authenticate and automatically navigate to root
    await actor.as('user', { role: 'ADMIN' }, { gotoRoot: true });

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });

  test('BasePage: Interactive methods and Hydration', async ({ page }) => {
    const loginPage = new SanityPage(page);
    await loginPage.visit();
    await loginPage.verifyLoaded();

    // Should wait for hydration (submit button enabled)
    await loginPage.waitForHydration('login-submit');

    // Should use interactive fill
    await loginPage.fillInteractive('login-identifier', 'test@example.com');
    await expect(page.getByTestId('login-identifier')).toHaveValue('test@example.com');
  });
});
