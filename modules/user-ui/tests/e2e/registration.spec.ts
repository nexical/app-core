import { test, expect } from '@tests/e2e/lib/fixtures';
import { RegistrationPage } from './pages/registration-page';

test.describe('1.1 User Registration', () => {

    test('Scenario A: Standard Registration', async ({ page, utils }) => {
        const registrationPage = new RegistrationPage(page);
        const email = utils.uniqueEmail('test');
        const username = utils.uniqueUsername('test');

        await registrationPage.visit();
        await registrationPage.register('Test User', username, email, 'SecurePass123!');

        // Check for success message
        await registrationPage.expectSuccess();
    });

    test('Scenario B: Registration Validation Failures', async ({ page, utils }) => {
        const registrationPage = new RegistrationPage(page);
        const email = utils.uniqueEmail('test');

        await registrationPage.visit();
        await registrationPage.register('Test User', 'ba', email, 'short');

        await expect(page.getByTestId('field-error-username')).toBeVisible();
        await expect(page.getByTestId('field-error-password')).toBeVisible();
    });
});
