import { type Page, expect } from '@playwright/test';
import { BasePage } from '@tests/e2e/lib/page';

/**
 * E2E Page Object Model Template
 */
export class __Name__Page extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async visit() {
    await this.safeGoto('/__name__');
    await this.verifyLoaded();
  }

  async verifyLoaded() {
    await expect(this.byTestId('__name__-container')).toBeVisible();
  }

  async submitForm() {
    await this.byTestId('submit-btn').click();
  }
}
