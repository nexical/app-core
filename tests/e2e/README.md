# Playwright E2E Testing Framework

This directory contains the End-to-End (E2E) Testing Framework, built on top of [Playwright](https://playwright.dev/).

## Philosophy

- **User-Centric**: Tests interact with the application as a real user would (clicking, typing, navigating).
- **Efficient Setup**: While the interaction is black-box, the **setup** is white-box. We use direct database access (via the `DataFactory` and `Actor` pattern) to instantly create potential complex states (e.g., "a user with 3 teams and a pending invitation"). This avoids the slowness of UI-based setup.
- **Modular**: Actors and Page Objects are defined within their respective modules, keeping the core framework lightweight.

## Directory Structure

- `lib/`: Core framework utilities.
  - `actor.ts`: The `Actor` class, handling user identity and data.
  - `page.ts`: Base class for Page Objects with hydration helpers.
  - `fixtures.ts`: Playwright test fixtures (injects `actor`, `utils`).
  - `utils.ts`: `TestUtils` for unique data generation.
- `global-setup.ts`: Runs once before all tests (resets DB).

## Framework Features

### 1. Robust Page Interaction (`BasePage`)

The `BasePage` class provides methods that automatically handle hydration and transient UI states:

- `fillInteractive(testId, value)`: Waits for the element to be visible and enabled before filling.
- `clickInteractive(testId)`: Waits for the element to be visible and enabled before clicking.
- `waitForHydration(testId?)`: Waits for the app to become interactive (default: waits for 'submit' button).
- `waitForToast(regexp?)`: Waits for a Sonner toast to appear.
- `waitForDialog(testId?, status?)`: Waits for a dialog/modal state change.
- `safeGoto(path)`: Built-in retries and wait for `networkidle`.

### 2. Unique Data Generation (`TestUtils`)

Use the `utils` fixture to generate collision-free test data:

```typescript
test('register user', async ({ page, utils }) => {
  const email = utils.uniqueEmail();
  const username = utils.uniqueUsername('admin');
});
```

### 3. Advanced Actor Usage

The `actor.as()` method supports an optional navigation step after authentication:

```typescript
// Login and automatically go to home page
await actor.as('user', { role: 'ADMIN' }, { gotoRoot: true });
```

---

## How to Write E2E Tests

### 1. Create a Test File

Create a file in `modules/*/tests/e2e`. The filename must end in `.spec.ts`.

### 2. Use the `actor` and `utils` Fixtures

Import `test` and `expect` from `@tests/e2e/lib/fixtures`.

```typescript
import { test, expect } from '@tests/e2e/lib/fixtures';

test('My e2e test', async ({ actor, utils, page }) => {
  // ...
});
```

### 3. Use Page Objects (Recommended)

Define Page Objects in your module's `tests/e2e/pages/` directory.

```typescript
// modules/user/tests/e2e/pages/login-page.ts
import { BasePage } from '@tests/e2e/lib/page';

export class LoginPage extends BasePage {
  async login(email, pass) {
    await this.waitForHydration();
    await this.fillInteractive('login-email', email);
    await this.fillInteractive('login-password', pass);
    await this.clickInteractive('login-submit');
  }
}
```

### 4. Select Elements by `data-testid`

**IMPORTANT: This is the preferred method for finding elements.**

Unless you are explicitly verifying styling or localized text, **always** select elements using their `data-testid` attribute.

---

## Running Tests

Run all E2E tests:

```bash
npm run test:e2e
```

Run a specific test in debug mode (UI):

```bash
npx playwright test tests/e2e/example.spec.ts --ui
```

This command will start the dev server automatically if it's not running.

---

## Best Practices & Common Pitfalls

Based on real-world debugging, follow these patterns to ensure stable and fast tests:

### 1. The "Visible but not Enabled" Trap (Hydration)

In React apps, an element might be rendered (visible) but not yet interactive (hydrated).

- **Pitfall**: `await page.click('button')` fails or does nothing because the click-event listener hasn't attached yet.
- **Solution**: Use `waitForHydration()` or wait for the element to be enabled:
  ```typescript
  await expect(this.byTestId('submit')).toBeEnabled();
  ```

### 2. Email Verification vs. Stability

If your flow triggers an email (e.g., Registration, Password Reset), real SMTP connections can be slow or brittle.

- **Tip**: For broad E2E tests, the framework automatically sets `MOCK_EMAIL=true` in `playwright.config.ts`. This makes tests 10x faster and eliminates SMTP authentication failures.
- **Tip**: If you _must_ test the email content, use the `HookSystem` to verify the `core.email.sent` event on the server side (Integration tests) rather than trying to read it in the UI.

### 3. Precise Feedback Assertions

Avoid checking for success/error messages using generic text or role selectors, as these are often non-unique or localized.

- **Pitfall**: `await expect(page.getByText('Success')).toBeVisible()` can match headers, nav items, or previous toasts.
- **Solution**: Add specific `data-testid` to your status messages:
  ```tsx
  // In your component
  {
    success && <div data-testid="profile-success">Profile Updated</div>;
  }
  ```
  ```typescript
  // In your test
  await profilePage.waitForSuccess(); // which waits for [data-testid="profile-success"]
  ```

### 4. Database State Collision

Even with a global reset, tests can collide if they use static data (like `test@example.com`).

- **Solution**: Always use `utils.uniqueEmail()` and `utils.uniqueUsername()` to ensure every test run is isolated.
- **Tip**: When checking for conflicts (e.g., "Email already exists"), use one unique email to create the user and another unique email to trigger the conflict.
