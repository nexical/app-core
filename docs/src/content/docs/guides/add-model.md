---
title: How to Add a Database Model
description: Step-by-step guide to extending the database schema.
sidebar:
  order: 3
---

Nexical uses an **Additive Schema** approach. You define models within your module, and the system merges them into the global schema.

## 1. Define the Model

Create or edit `models.yaml` in your module root.

```yaml
# modules/project/models.yaml
models:
  Project:
    fields:
      id:
        type: String
        attributes:
          - '@id'
          - '@default(cuid())'
      name:
        type: String
      ownerId:
        type: String

      # Define relations
      tasks:
        type: Task[]

  Task:
    fields:
      id: { type: String, attributes: ['@id', '@default(cuid())'] }
      title: { type: String }
      projectId: { type: String }
      project:
        type: Project
        attributes: ['@relation(fields: [projectId], references: [id])']
```

## 2. Compile the Schema

Run the database compiler to check for errors and generate the Prisma Client.

```bash
nexical db:generate
```

## 3. Create Migration

Create a SQL migration file for the new changes.

```bash
npx prisma migrate dev --name add_projects
```

## 4. Use the Model

Access the new model via the global `db` client.

```ts
import { db } from '@/lib/core/db';

await db.project.create({
  data: { name: 'My New Project' },
});
```
