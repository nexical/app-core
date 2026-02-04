import { expect } from '@playwright/test';
import { BasePage } from '@tests/e2e/lib/page';

export class RegistrationPage extends BasePage {
  async visit() {
    await this.safeGoto('/register');
  }

  async verifyLoaded() {
    await expect(this.byTestId('register-submit')).toBeVisible();
  }

  override async waitForHydration(testId: string = 'register-submit') {
    await super.waitForHydration(testId);
  }

  async register(name: string, username: string, email: string, pass: string) {
    await this.verifyLoaded();
    await this.waitForHydration('register-submit');
    await this.fillInteractive('register-name', name);
    await this.fillInteractive('register-username', username);

    const emailField = this.byTestId('register-email');

    // If there's a token in URL, wait for the field to become readonly (hydration)
    if (this.page.url().includes('token=')) {
      await expect(emailField)
        .toHaveAttribute('readonly', '', { timeout: 10000 })
        .catch(() => {});
    }

    const isReadonly = (await emailField.getAttribute('readonly')) !== null;
    if (!isReadonly) {
      await this.fillInteractive('register-email', email);
    }

    await this.fillInteractive('register-password', pass);
    await this.fillInteractive('register-confirm-password', pass);
    await this.clickInteractive('register-submit');
  }

  async expectSuccess() {
    await expect(this.byTestId('register-success')).toBeVisible({ timeout: 10000 });
  }
}
