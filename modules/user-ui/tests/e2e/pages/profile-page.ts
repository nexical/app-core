import { expect } from '@playwright/test';
import { BasePage } from '@tests/e2e/lib/page';

export class ProfilePage extends BasePage {
    async visit() {
        // Since profile is a detail panel, we navigate to home and open it via the menu
        await this.page.goto('/');
        await this.clickInteractive('user-menu-trigger');
        await this.clickInteractive('user-menu-settings');
        await this.verifyLoaded();
    }

    async save() {
        await this.clickInteractive('profile-save-button');
    }

    async updateBasicInfo(name: string) {
        await this.verifyLoaded();
        await this.fillInteractive('profile-display-name', name);
        await this.save();
    }

    async verifyLoaded() {
        await expect(this.byTestId('profile-save-button')).toBeVisible();
    }

    async updatePassword(newPass: string) {
        await this.verifyLoaded();
        await this.fillInteractive('profile-new-password', newPass);
        await this.fillInteractive('profile-confirm-password', newPass);
        await this.save();
    }

    async updateEmail(email: string) {
        await this.verifyLoaded();
        await this.fillInteractive('profile-email', email);
        await this.save();
    }

    async waitForSuccess() {
        await expect(this.byTestId('profile-success')).toBeVisible({ timeout: 10000 });
    }

    async waitForError(pattern?: string | RegExp) {
        const error = this.byTestId('profile-form-error');
        await expect(error).toBeVisible({ timeout: 10000 });
        if (pattern) {
            await expect(error).toContainText(pattern);
        }
    }
}
