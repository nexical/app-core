---
title: user-email
---

# User Email Module

The `user-email` module provides transactional email templates for user-related events.

## Features

- **Welcome Email**: Sent upon successful registration.
- **Password Reset**: Contains the secure reset token link.
- **Verification**: Email address verification flow.

## Integration

This module registers templates with the `EmailRegistry`.

```ts
// Example Registration
EmailRegistry.register('user:welcome', WelcomeEmail);
```
