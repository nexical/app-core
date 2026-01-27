import { test, expect } from '@tests/e2e/lib/fixtures';
import { PasswordRecoveryPage } from './pages/password-recovery-page';
import { LoginPage } from './pages/login-page';

test.describe('1.4 Password Recovery', () => {

    test('Scenario A: Request Reset Link', async ({ page }) => {
        const recoveryPage = new PasswordRecoveryPage(page);

        await recoveryPage.visit();
        await recoveryPage.requestReset('admin@nexical.os');

        // UI confirms "If account exists, email sent"
        await expect(page.getByTestId('forgot-password-success')).toContainText('If an account exists');
    });

    test('Scenario B: Complete Reset', async ({ actor, page }) => {
        const user = await actor.data.create('user', {
            password: 'OldPassword123!'
        });
        const token = `reset_${Date.now()}`;

        // Seed Reset Token
        await actor.data.prisma.passwordResetToken.create({
            data: {
                email: user.email,
                token: token,
                expires: new Date(Date.now() + 1000 * 60 * 60) // 1 hour
            }
        });

        const recoveryPage = new PasswordRecoveryPage(page);
        const loginPage = new LoginPage(page);

        await test.step('Navigate to reset link', async () => {
            await recoveryPage.gotoReset(token);
        });

        await test.step('Enter new password', async () => {
            await recoveryPage.resetPassword('NewPassword123!');
        });

        await test.step('Verify success', async () => {
            await expect(page).toHaveURL(/\/login/);
        });

        await test.step('Verify login with new password', async () => {
            await loginPage.login(user.email, 'NewPassword123!');
            await expect(page).toHaveURL('/');
        });
    });

    test('Scenario C: Invalid/Expired Link', async ({ page }) => {
        const recoveryPage = new PasswordRecoveryPage(page);
        await recoveryPage.gotoReset('INVALID_TOKEN');
        await expect(page.getByTestId('reset-password-expired-text')).toBeVisible();
    });

});
