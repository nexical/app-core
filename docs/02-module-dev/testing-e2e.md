---
title: E2E Testing (Playwright)
description: The Playwright-based End-to-End testing framework.
sidebar:
  order: 6
---

The E2E framework interacts with the application as a real user would, using Playwright.

## Philosophy

- **User-Centric**: Click, type, navigate.
- **Efficient Setup**: Use `DataFactory` for state setup, UI for interaction.

## Writing Tests

### 1. Fixtures

Use the `actor` and `utils` fixtures.

```ts
import { test, expect } from '@tests/e2e/lib/fixtures';

test('My e2e test', async ({ actor, utils, page }) => {
  // Test logic
});
```

### 2. Page Objects

Encapsulate logic in Page Objects.

```ts
export class LoginPage extends BasePage {
  async login(email, pass) {
    await this.waitForHydration();
    await this.fillInteractive('login-email', email);
    await this.clickInteractive('login-submit');
  }
}
```

### 3. Selectors

**ALWAYS** use `data-testid`.

```ts
await page.getByTestId('login-submit').click();
```

## Running Tests

```bash
# Run all in Docker
npm run test:e2e

# Run interactively (UI Mode)
npm run test:e2e:ui
```
