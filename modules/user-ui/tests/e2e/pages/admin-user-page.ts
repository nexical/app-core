import { expect } from '@playwright/test';
import { BasePage } from '@tests/e2e/lib/page';

export class AdminUserPage extends BasePage {
    async visit() {
        await this.safeGoto('/admin/users');
    }

    async verifyLoaded() {
        await expect(this.byTestId('admin-user-management')).toBeVisible();
    }

    async openInviteDialog() {
        await this.waitForHydration('admin-invite-user-button');
        await this.clickInteractive('admin-invite-user-button');
        await this.waitForDialog('admin-invite-dialog');
    }

    async inviteUser(email: string, role: string = 'EMPLOYEE') {
        await this.fillInteractive('admin-invite-email', email);
        // Role selection could be added here if needed
        await this.clickInteractive('admin-invite-submit');
    }

    async expectSuccess(message: string | RegExp = /sent successfully|success/i) {
        await this.waitForToast(message);
        await this.waitForDialog('admin-invite-dialog', 'hidden');
    }
}
