---
name: forge-agent
description: Specific knowledge of the JobProcessor and PersistentAgent classes. It understands the async queue system.
---

# forge-agent Skill

## Critical Standards

You **MUST** follow the standards defined in:

- `ARCHITECTURE.md`: Separation of concerns and 3-tier architecture.
- `CODE.md`: Coding style, hygiene, and **[Uniform Service Response](./CODE.md#uniform-service-response)**.
- `MODULES.md`: Module structure, Hook system, and Agent authority.
- **Core Neutrality**: The core platform must never know what modules are installed on the system. If the core needs to know information about modules it should implement module loaders or registries.

This skill governs the creation of **AI Agents** and **Background Workers**.

## 1. Concepts

- **Persistent Agents**: Long-running loops (Pollers, Watchers) that run on a defined schedule.
- **Job Processors**: Event-driven tasks (Queue Consumers) triggered by `api.job.create()`.

## 2. Directory Structure & Naming

- **Path**: `modules/<module-name>/src/agent/`
- **Naming Convention**: `kebab-case.ts`. (e.g., `sync-project.ts`, `watcher.ts`).

## 3. Creating a Job Processor

Processors execute jobs dispatched via the API.

**Requirements:**

1.  **Inheritance**: Must extend `JobProcessor<T>` from `@nexical/agent/src/core/processor.js`.
2.  **Signature**: Must implement `public async process(job: AgentJob<T>, context: AgentContext): Promise<AgentResult | void>`.
3.  **Source of Truth**: Payloads **MUST** be defined in `models.yaml` (db: false, api: false) and imported from the SDK. Defining inline schemas or using manual types in the agent file is **STRICTLY FORBIDDEN**.
4.  **No Direct DB Access**: Must delegate **ALL** database interactions to the Service Layer.
5.  **Uniform Service Response**: MUST destructure and check `success` before accessing data.
6.  **Retries**: MUST throw an error if a critical operation or service fails to trigger the queue's retry logic.
7.  **Context**: Use `context.logger` for job-specific logging and `context.api` for federated API access.

```typescript
import {
  JobProcessor,
  type AgentJob,
  type AgentContext,
  type AgentResult,
} from '@nexical/agent/src/core/processor.js';
import { HookSystem } from '@/lib/modules/hooks';
import { MyService } from '../services/my-service';
// Import generated schema from module SDK
import { SyncPayloadSchema } from '@modules/my-module/sdk';

export class MyProcessor extends JobProcessor<typeof SyncPayloadSchema> {
  public jobType = 'my-module.sync';

  // @ts-ignore - Handle Zod version mismatch between agent package and module
  public schema = SyncPayloadSchema;

  public async process(
    job: AgentJob<typeof SyncPayloadSchema>,
    context: AgentContext,
  ): Promise<AgentResult | void> {
    const { projectId } = job.payload;
    const { logger } = context;

    logger.info(`Starting sync for project ${projectId}`);

    // 1. Delegate to Service Layer
    const res = await MyService.processData(projectId);

    // 2. REQUIRED: Check success flag from ServiceResponse
    if (!res.success) {
      // Throwing triggers the queue's retry logic
      throw new Error(`Sync failed: ${res.error?.message || 'Unknown error'}`);
    }

    // 3. Return AgentResult
    return {
      success: true,
      data: { projectId, timestamp: Date.now() },
    };
  }
}
```

## 4. Creating a Persistent Agent

Agents run periodically to monitor state or perform routine tasks.

**Requirements:**

1.  Must extend `PersistentAgent` from `@nexical/agent/src/core/persistent.js`.
2.  Must define a unique `public name`.
3.  Must handle the `ServiceResponse<T>` wrapper (check `success`) for **ALL** calls.
4.  Must interact via Services or the Federated SDK (`this.api`).

```typescript
import { PersistentAgent } from '@nexical/agent/src/core/persistent.js';
import { HookSystem } from '@/lib/modules/hooks';

export class DataWatcher extends PersistentAgent {
  public name = 'data-watcher';
  protected intervalMs = 60000; // 1 minute

  async tick() {
    this.logger.info('Watcher ticking...');

    // 1. Use Federated SDK (this.api) or local Services
    const res = await this.api.project.list();

    // 2. REQUIRED: Check success before accessing .data
    if (!res.success) {
      this.logger.error(`Failed to fetch projects: ${res.error?.message}`);
      return;
    }

    for (const project of res.data) {
      // ... logic
    }
  }
}
```

## 5. Interaction Rules

- **No Direct DB Access**: Agents MUST NOT import `db` from `@/lib/core/db`.
- **Service Priority**: Use local Services for intra-module logic and database orchestration.
- **SDK Usage**: Use the Federated `api` client (`context.api` or `this.api`) when interacting with other modules.
- **Logging**: Use `context.logger` for job-specific tracing and `this.logger` for agent-wide logging.
- **Error Handling**: ALWAYS destructure `{ success, error, data }` and check `success`.

## 6. Anti-patterns (FORBIDDEN)

- ❌ **Direct DB Access**: Do not use Prisma (`db`) inside the agent.
- ❌ **Inline Payloads**: Do not define Zod schemas in the agent file; use `models.yaml`.
- ❌ **Manual Types**: Do not use `src/lib/core/types.ts` for payloads; use the SDK.
- ❌ **Unchecked Success**: Do not access `.data` without checking `.success`.
- ❌ **Silencing Errors**: Do not catch errors without re-throwing in Job Processors.
