---
title: System Utilities
description: Logger, Config, and other core helpers.
sidebar:
  order: 5
---

## Logger

A structured logger that enforces consistent JSON formatting for better observability.

```ts
import { Logger } from '@/lib/core/logger';

Logger.info('User logged in', { userId: '123' });
Logger.error('Failed to save file', error, { path: '/tmp/file' });
```

## Config

A centralized configuration loader.

```ts
import { config } from '@/lib/core/config';

console.log(config.PUBLIC_SITE_URL);
```

## Service Locator

For loose coupling between core services.

```ts
import { ServiceLocator } from '@/lib/modules/service-locator';

const authService = ServiceLocator.get('auth');
```
