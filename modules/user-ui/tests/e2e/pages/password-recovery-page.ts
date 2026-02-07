import { expect } from '@playwright/test';
import { BasePage } from '@tests/e2e/lib/page';

export class PasswordRecoveryPage extends BasePage {
  async visit() {
    await this.safeGoto('/forgot-password');
  }

  async verifyLoaded() {
    // Since it has two main states, we check for either submit button if appropriate,
    // but typically visit() goes to forgot-password.
    await expect(
      this.byTestId('forgot-password-submit').or(this.byTestId('reset-password-submit')),
    ).toBeVisible();
  }

  async requestReset(email: string) {
    await this.waitForHydration('forgot-password-submit');
    await this.fillInteractive('forgot-password-email', email);
    await this.clickInteractive('forgot-password-submit');
  }

  async resetPassword(password: string) {
    await this.waitForHydration('reset-password-submit');
    await this.fillInteractive('reset-password-new-password', password);
    await this.fillInteractive('reset-password-confirm-password', password);
    await this.clickInteractive('reset-password-submit');
  }

  async gotoReset(token: string) {
    await this.safeGoto(`/reset-password/${token}`);
  }
}
