---
name: implement-email-registry
description: Global, stateless registry for managing transactional email templates in the backend.
---

# Skill: Implement Email Registry

## Description

The **Email Registry** is a specialized **Static Infrastructure Utility** responsible for managing transactional email templates. Unlike dynamic UI registries, it uses a **Static Class** pattern to ensure global, stateless availability across the backend. It decouples the _intent_ to send an email (e.g., "user:invite") from the _implementation_ (the specific React component), allowing for theme overrides and pluggable behavior.

## Canon Rules

1.  **Static Infrastructure Pattern**: The registry MUST be implemented as a `static` class with `private static` storage. It MUST NOT be instantiated.
2.  **Location**: The registry MUST be located in `core/src/lib/email/` (e.g., `email-registry.ts`).
3.  **Pluggable Registration**: It MUST implement a `register(id, component)` method that allows overwriting existing keys (Last-Write-Wins) to support the "Theme Override" pattern.
4.  **Rendering Facade**: It MUST implement a static `render(id, props)` method that encapsulates the third-party rendering logic (e.g., `@react-email/render`) and handles "Template Not Found" errors explicitly.
5.  **Type Safety**: Storage should use `unknown` for props to maintain flexibility, casting only at the render point.

## File Structure

```text
core/src/lib/email/
├── email-registry.ts      # The Static Registry
└── email-sender.ts        # The Transporter (Nodemailer/Resend)
```

## Usage

### 1. Registration (Module Init)

Modules register templates in their `server-init.ts`.

```typescript
// modules/user/src/server-init.ts
import { EmailRegistry } from '@/lib/email/email-registry';
import InviteEmail from './emails/invite-user';

export async function init() {
  // Register the default template
  EmailRegistry.register('user:invite', InviteEmail);
}
```

### 2. Overriding (Theme Module)

A theme module can replace the template by registering the same ID.

```typescript
// modules/theme-dark/src/server-init.ts
import { EmailRegistry } from '@/lib/email/email-registry';
import DarkInviteEmail from './emails/dark-invite';

export async function init() {
  // Overrides 'user:invite' globally
  EmailRegistry.register('user:invite', DarkInviteEmail);
}
```

### 3. Consumption (Service Layer)

Services render templates via the registry, unaware of which component is actually used.

```typescript
// modules/user/src/services/user-service.ts
import { EmailRegistry } from '@/lib/email/email-registry';

// Render returns the HTML string
const html = await EmailRegistry.render('user:invite', {
  name: 'Alice',
  url: 'https://example.com/join',
});
```
