import { type Page, expect } from '@playwright/test';
import { BasePage } from '@tests/e2e/lib/page';

/**
 * E2E Page Object Model Template
 *
 * Rules:
 * - Extend BasePage.
 * - Use safeGoto() for navigation.
 * - Call byTestId() directly within methods (do not store as private members).
 * - Implement visit() and verifyLoaded() methods.
 */
export class __Name__Page extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // 1. Navigation
  async visit() {
    await this.safeGoto('/__name__');
    await this.verifyLoaded();
  }

  // 2. Verification
  async verifyLoaded() {
    await expect(this.byTestId('__name__-container')).toBeVisible();
  }

  // 3. Actions
  async submitForm() {
    await this.byTestId('submit-btn').click();
  }
}
