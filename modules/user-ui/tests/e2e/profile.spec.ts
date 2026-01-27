import { test, expect } from '@tests/e2e/lib/fixtures';
import { ProfilePage } from './pages/profile-page';

test.describe('1.2 User Profile', () => {

    test('Scenario A: Update Basic Info', async ({ actor, page }) => {
        await actor.as('user', { name: 'Initial Name' }, { gotoRoot: true });
        const profilePage = new ProfilePage(page);

        await profilePage.visit();
        await profilePage.updateBasicInfo('Updated Name');
        await profilePage.waitForSuccess();

        await expect(page.getByTestId('profile-display-name')).toHaveValue('Updated Name');
    });

    test('Scenario B: Update Password', async ({ actor, page }) => {
        await actor.as('user', {}, { gotoRoot: true });
        const profilePage = new ProfilePage(page);

        await profilePage.visit();
        await profilePage.updatePassword('NewSecurePass123!');
        await profilePage.waitForSuccess();
    });

    test('Scenario C: Email Change Conflict', async ({ actor, page, utils }) => {
        // Create an existing user with a known email
        const existingEmail = utils.uniqueEmail('conflict');
        await actor.data.create('user', { email: existingEmail });

        // Login as another user
        await actor.as('user', {}, { gotoRoot: true });
        const profilePage = new ProfilePage(page);

        await profilePage.visit();
        await profilePage.updateEmail(existingEmail);

        // Expect error message
        await profilePage.waitForError(/exists|already/i);
    });
});
