---
title: Email System
description: Pluggable email templates and sending logic.
sidebar:
  order: 6
---

The Email System decouples the intent to send an email from the actual template implementation.

## EmailRegistry

Modules register React components to handle specific email "intents" (e.g., `user:welcome`).

### Registering a Template

```ts
// modules/user/src/emails/init.ts
import { EmailRegistry } from '@/lib/email/email-registry';
import WelcomeEmail from './WelcomeEmail';

EmailRegistry.register('user:welcome', WelcomeEmail);
```

### Sending an Email

The sender renders the template by ID.

```ts
import { EmailRegistry } from '@/lib/email/email-registry';
import { sendEmail } from '@/lib/email/email-sender';

const html = await EmailRegistry.render('user:welcome', { name: 'Alice' });
await sendEmail({ to: 'alice@example.com', subject: 'Welcome', html });
```
