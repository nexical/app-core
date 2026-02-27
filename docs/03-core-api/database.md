---
title: Database & Schema
description: The Additive Schema Architecture.
sidebar:
  order: 3
---

The Nexical Ecosystem uses a unique **Additive Schema** approach. Instead of a single monolithic `schema.prisma` file, each module defines its own `models.yaml`.

## The `db` Client

The platform provides a singleton `db` client that is automatically generated to include all models from all modules.

**Location**: `src/lib/core/db.ts`

```ts
import { db } from '@/lib/core/db';

const users = await db.user.findMany();
```

## Additive Schema (`models.yaml`)

Modules extend the database by placing a `models.yaml` file in their root.

```yaml
# modules/crm/models.yaml
models:
  Contact:
    fields:
      id: { type: String, attributes: ['@id', '@default(cuid())'] }
      email: { type: String, attributes: ['@unique'] }

  # Extending a Core Model
  User:
    fields:
      vipStatus: { type: Boolean, attributes: ['@default(false)'] }
```

The build system (Arc) compiles these fragments into the final Prisma schema.
