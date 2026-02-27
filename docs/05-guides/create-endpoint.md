---
title: How to Create an API Endpoint
description: Step-by-step guide to building a new API route using the Modular API system.
sidebar:
  order: 2
---

The Nexical Ecosystem uses a **Contract-First** API development workflow. You define the contract in YAML, and the system generates the boilerplate.

## 1. Define the Endpoint

Open your module's `api.yaml` and add a new operation.

```yaml
# modules/crm/api.yaml
Lead:
  - path: /leads/create
    verb: POST
    method: createLead
    summary: 'Create a new sales lead'
    action: create-lead
    response: ServiceResponse<Lead>
```

## 2. Generate Code

Run the generator to create the Action and Service stubs.

```bash
nexical gen api crm
```

## 3. Implement the Action

Edit the generated Action file in `modules/crm/src/actions/create-lead.ts`.

```ts
import { z } from 'zod';
import { LeadService } from '../services/lead-service';

export class CreateLeadAction {
  // Define input validation
  static schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
  });

  static async run(input: unknown, ctx: APIContext) {
    // Validate input
    const data = this.schema.parse(input);

    // Delegate to Service
    return await LeadService.create(data);
  }
}
```

## 4. Consume the API

Use the global typed SDK in your frontend components.

```ts
import { api } from '@/lib/api/api';

await api.lead.createLead({
  name: 'Acme Corp',
  email: 'contact@acme.com',
});
```
