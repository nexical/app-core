import { type Page, expect } from '@playwright/test';

export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to the page.
   */
  abstract visit(params?: unknown): Promise<void>;

  /**
   * Verifies that the page has loaded successfully.
   * Should throw an error if validation fails.
   */
  abstract verifyLoaded(): Promise<void>;

  /**
   * Helper to navigate relative to base URL with retries and idle wait.
   */
  protected async safeGoto(path: string, options: { retries?: number } = {}) {
    const maxRetries = options.retries ?? 2;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        await this.page.goto(path, { waitUntil: 'networkidle' });
        return;
      } catch (e) {
        attempt++;
        if (attempt > maxRetries) throw e;
        console.warn(
          `[BasePage] Navigation to ${path} failed, retrying (${attempt}/${maxRetries})...`,
        );
      }
    }
  }

  /**
   * Waits for hydration by ensuring a selector is enabled.
   * Often used with a submit button.
   */
  async waitForHydration(testId: string = 'submit') {
    const locator = this.byTestId(testId).first();
    await expect(locator).toBeEnabled({ timeout: 15000 });
  }

  /**
   * Fills an input after ensuring it's interactive (hydrated).
   */
  async fillInteractive(testId: string, value: string) {
    const locator = this.byTestId(testId);
    await expect(locator).toBeVisible();
    await expect(locator).toBeEnabled();
    await locator.fill(value);
  }

  /**
   * Clicks an element after ensuring it's interactive (hydrated).
   */
  async clickInteractive(testId: string) {
    const locator = this.byTestId(testId);
    await expect(locator).toBeVisible();
    await expect(locator).toBeEnabled();
    await locator.click();
  }

  /**
   * Waits for a toast message to appear and optionally checks text.
   */
  async waitForToast(content?: string | RegExp) {
    const toast = this.page.locator('ol[data-sonner-toaster]').locator('li');
    await expect(toast.first()).toBeVisible({ timeout: 10000 });
    if (content) {
      await expect(toast).toContainText(content);
    }
  }

  /**
   * Waits for a dialog to appear or disappear.
   */
  async waitForDialog(testId?: string, state: 'visible' | 'hidden' = 'visible') {
    const locator = testId ? this.byTestId(testId) : this.page.getByRole('dialog');
    if (state === 'visible') {
      await expect(locator).toBeVisible();
    } else {
      await expect(locator).not.toBeVisible();
    }
  }

  /**
   * Helper to find element by testId
   */
  byTestId(testId: string) {
    return this.page.getByTestId(testId);
  }
}
