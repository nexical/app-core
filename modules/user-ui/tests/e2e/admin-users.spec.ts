import { test, expect } from '@tests/e2e/lib/fixtures';
import { AdminUserPage } from './pages/admin-user-page';

test.describe('3. Admin User Management', () => {

    test('3.1 Scenario A: View All Users (Admin)', async ({ actor, page }) => {
        await actor.as('user', { role: 'ADMIN' }, { gotoRoot: true });
        const adminPage = new AdminUserPage(page);

        await adminPage.visit();
        await adminPage.verifyLoaded();

        await expect(page.getByTestId('admin-title')).toBeVisible();
        await expect(page.getByTestId('admin-header-name')).toBeVisible();
        await expect(page.getByTestId('admin-header-email')).toBeVisible();
    });

    test('3.1 Scenario B: Unauthorized Access', async ({ actor, page }) => {
        await actor.as('user', { role: 'EMPLOYEE' }, { gotoRoot: true });
        const adminPage = new AdminUserPage(page);

        await adminPage.visit();

        // Expect 403 or Redirect
        await expect(page).not.toHaveURL(/\/admin\/users/);
    });

    test('3.2 Scenario A: Invite User', async ({ actor, page, utils }) => {
        await actor.as('user', { role: 'ADMIN' }, { gotoRoot: true });
        const adminPage = new AdminUserPage(page);
        const email = utils.uniqueEmail('invited');

        await adminPage.visit();
        await adminPage.verifyLoaded();

        await test.step('Open Invite Dialog', async () => {
            await adminPage.openInviteDialog();
        });

        await test.step('Send Invitation', async () => {
            await adminPage.inviteUser(email);
        });

        await test.step('Verify Success', async () => {
            await adminPage.expectSuccess();
        });
    });

    test('3.3 Manage User State', async ({ actor, page }) => {
        const admin = await actor.as('user', { role: 'ADMIN' }, { gotoRoot: true });
        // Create a target user
        const targetUser = await actor.data.create('user', { name: 'Target User' });

        const adminPage = new AdminUserPage(page);
        await adminPage.visit();
        await adminPage.verifyLoaded();

        const row = page.getByTestId(`admin-user-row-${targetUser.email}`);

        await test.step('Promote User', async () => {
            await row.getByTestId('admin-actions-trigger').click();
            await page.getByTestId('admin-action-edit-role').click();

            await page.getByTestId('admin-edit-role-trigger').click();
            await page.getByTestId('role-option-ADMIN').click();
            await page.getByTestId('admin-edit-role-submit').click();

            await expect(row).toContainText('ADMIN');
        });

        await test.step('Deactivate User', async () => {
            await row.getByTestId('admin-actions-trigger').click();
            await page.getByTestId('admin-action-toggle-status').click();

            await expect(row).toContainText('INACTIVE');
        });

        await test.step('Delete User', async () => {
            await row.getByTestId('admin-actions-trigger').click();
            await page.getByTestId('admin-action-delete').click();

            await expect(page.getByTestId('confirm-deletion-input')).toBeVisible();
            await page.getByTestId('confirm-deletion-input').fill(targetUser.name!);

            await page.getByTestId('confirm-deletion-submit').click();

            await expect(page.getByTestId(`admin-user-row-${targetUser.email}`)).not.toBeVisible();
        });
    });

});
