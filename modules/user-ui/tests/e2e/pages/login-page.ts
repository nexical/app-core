import { expect } from '@playwright/test';
import { BasePage } from '@tests/e2e/lib/page';

export class LoginPage extends BasePage {
  async visit() {
    await this.safeGoto('/login');
  }

  async verifyLoaded() {
    await expect(this.byTestId('login-submit')).toBeVisible();
  }

  async login(identifier: string, password: string) {
    await this.waitForHydration('login-submit');
    await this.fillInteractive('login-identifier', identifier);
    await this.fillInteractive('login-password', password);
    await this.clickInteractive('login-submit');
  }

  async expectError(message: string | RegExp) {
    const error = this.byTestId('login-error');
    await expect(error).toBeVisible({ timeout: 15000 });
    await expect(error).toContainText(message);
  }
}
