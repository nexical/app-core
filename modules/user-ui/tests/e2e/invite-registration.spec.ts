import { test, expect } from '@tests/e2e/lib/fixtures';
import { RegistrationPage } from './pages/registration-page';

test.describe('1.2 User Registration (Invite Flow)', () => {
  let registrationPage: RegistrationPage;

  test.beforeEach(async ({ page }) => {
    registrationPage = new RegistrationPage(page);
  });

  test('Scenario A: Valid Invitation', async ({ actor, page }) => {
    const email = `invitee.${Date.now()}@example.com`;
    const token = `token_${Date.now()}`;

    await test.step('Seed Invitation', async () => {
      // Use actor.data.create for factory defaults & consistency
      await actor.data.create('invitation', {
        email,
        token,
        role: 'EMPLOYEE',
        expires: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
      });
    });

    await test.step('Navigate to register with token', async () => {
      await page.goto(`/register?token=${token}&email=${encodeURIComponent(email)}`);
    });

    await test.step('Verify email is pre-filled and locked', async () => {
      const emailField = page.getByTestId('register-email');
      await expect(emailField).toHaveValue(email);
      // Non-editable check
      await expect(emailField).toHaveAttribute('readonly', '');
    });

    await test.step('Complete registration', async () => {
      await registrationPage.register(
        'Invited User',
        `invited_${Date.now()}`,
        email,
        'Password123!',
      );
    });

    await test.step('Verify success', async () => {
      await registrationPage.expectSuccess();
    });
  });

  test('Scenario B: Expired/Invalid Token', async ({ page }) => {
    const email = `hacker.${Date.now()}@example.com`;
    await page.goto(`/register?token=INVALID_TOKEN&email=${encodeURIComponent(email)}`);

    await test.step('Attempt submission', async () => {
      // Need to handle hydration even if manually clicking
      await registrationPage.waitForHydration();

      const emailInput = page.getByTestId('register-email');
      if ((await emailInput.inputValue()) === '') {
        await emailInput.fill(`test_${Date.now()}@example.com`);
      }
      await page.getByTestId('register-name').fill('Hacker');
      await page.getByTestId('register-username').fill(`hacker_${Date.now()}`);
      await page.getByTestId('register-password').fill('Password123!');
      await page.getByTestId('register-confirm-password').fill('Password123!');

      const submitBtn = page.getByTestId('register-submit');
      await expect(submitBtn).toBeEnabled();
      await submitBtn.click();
    });

    await test.step('Verify error', async () => {
      // Wait for error to appear with timeout
      const error = page.getByTestId('register-error');
      await expect(error).toBeVisible({ timeout: 15000 });
      const errorText = await error.innerText();
      expect(errorText.toLowerCase()).toMatch(
        /invalid|expired|restricted|error|user\.service\.error|bad request/i,
      );
    });
  });
});
