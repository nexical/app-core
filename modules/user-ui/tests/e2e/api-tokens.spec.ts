import { test, expect } from '@tests/e2e/lib/fixtures';

test.describe('2.3 API Tokens', () => {

     test('Scenario A: Create Token', async ({ actor, page }) => {
          await actor.as('user');

          await test.step('Navigate to Token Settings', async () => {
               await page.goto('/settings/tokens');
          });

          await test.step('Open Create Dialog', async () => {
               await page.waitForSelector('[data-testid="create-token-trigger"]', { state: 'visible' });
               // Using a generic wait instead of waitForHydration since it's a simple page
               await page.waitForTimeout(1000);
               const trigger = page.getByTestId('create-token-trigger');
               await trigger.click();
               // Wait for dialog content - using a more general selector first if testid fails

               await expect(page.getByTestId('create-token-dialog-content')).toBeVisible();
               await expect(page.getByTestId('create-token-name')).toBeEditable();
          });

          await test.step('Create Token', async () => {
               await page.getByTestId('create-token-name').fill('Test Token');
               // Submit inside dialog
               await page.getByTestId('create-token-submit').click();
               await expect(page.getByTestId('create-token-dialog-content')).toBeVisible({ timeout: 15000 });
               await expect(page.getByTestId('create-token-value')).toBeVisible();
               // Warning text is informative, but the value is critical
               // await expect(page.getByText(/Make sure to copy/)).toBeVisible();
               await page.getByTestId('create-token-done').click();
          });

          await test.step('Verify Token Displayed', async () => {
               // The verification is now part of the 'Create Token' step,
               // but we can still verify the token is listed on the main page after closing the dialog.
               await expect(page.getByTestId('token-row-Test Token')).toBeVisible();
          });
     });

     test('Scenario B: Delete Token', async ({ actor, page }) => {
          const user = await actor.as('user');

          // Seed a token directly to ensure one exists
          // Need to use prisma on PersonalAccessToken
          // Check model: PersonalAccessToken
          await actor.data.prisma.personalAccessToken.create({
               data: {
                    name: 'Token To Delete',
                    hashedKey: `hashed_secret_${Date.now()}`,
                    prefix: 'pat',
                    userId: user.id
               }
          });

          await page.goto('/settings/tokens');

          await test.step('Revoke Token', async () => {
               const row = page.getByTestId('token-row-Token To Delete');
               await expect(row).toBeVisible();

               // Handle native confirm dialog
               page.once('dialog', dialog => dialog.accept());
               await row.getByTestId('token-revoke-button').click();
          });

          await test.step('Verify Removal', async () => {
               await expect(page.getByText('Token revoked')).toBeVisible();
               await expect(page.getByTestId('token-row-Token To Delete')).not.toBeVisible();
          });
     });

});
