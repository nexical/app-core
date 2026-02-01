---
name: construct-agent
description: Expert guide for building Autonomous Agentic Modules using JobProcessor and PersistentAgent patterns.
---

# construct-agent Skill

## Critical Standards

You **MUST** follow the standards defined in:

- `MODULES.md`: Section 19 (Agentic Modules).
- `CODE.md`: Strict Types (Aliased imports must use `@/` or `@modules/`).
- **Core Neutrality**: The core platform must never know what modules are installed on the system. If the core needs to know information about modules it should implement module loaders or registries.

## 1. Directory Structure

Agent files are auto-discovered if placed in `modules/{name}/src/agent/`.

- **Location**: `src/agent/*.ts`

## 2. Naming Conventions

To ensure consistency and discovery, you **MUST** use these functional suffixes for your classes:

- **Processors**: Must end in `Processor` (e.g., `SyncUserProcessor`).
- **Agents**: Must end in `Agent` (e.g., `StatusWatcherAgent`).

## 3. The Rule of Authority (Service Authority Pattern)

Background agents are **Consumers**, not **Authorities**.

- **CRITICAL**: Only Service classes are allowed to import the database client (`db`).
- **FORBIDDEN**: Importing the database client (`import { db } from '@/lib/db'`) directly into an agent.
- **REQUIRED**: Perform all data mutations via **Services** (Domain Logic) or the **Global SDK** (`this.api` or `context.api`).

## 4. Side Effects (Hook Extensibility)

Agents must remain integrated with the broader ecosystem to allow for cross-module extension.

- **REQUIRED**: Always use `HookSystem.dispatch` to signal completion or state changes (e.g., `entity.created`, `entity.updated`). This allows other modules to react to background activities without direct coupling.

## 5. Identity & Context (System Actor)

Background jobs often run without a "User" session.

- **System Actor**: Use `actorType: 'system'` and `actorId: 'system'` when creating jobs or performing operations from background processes.
- **Audit Trail**: The `system` actor is recognized for automated cleanup, maintenance, and audit trails where no human interaction is involved.

## 6. Job Processors (`templates/processor.ts`)

Processors handle discrete, asynchronous tasks (Jobs).

- **Base Class**: `JobProcessor<Input>` from `@nexical/agent/src/core/processor.js`.
- **Key Properties**:
  - `public jobType` (string): The unique identifier for the job (e.g., `user.sync`).
  - `public schema` (Zod Schema): The validation schema for the job payload using `zod`.
- **Method**: `process(job, context)` returning `Promise<AgentResult | void>`.

## 7. Persistent Agents (`templates/watcher.ts`)

Persistent Agents are long-running background workers that wake up on a defined interval.

- **Base Class**: `PersistentAgent` from `@nexical/agent/src/core/persistent.js`.
- **Key Properties**:
  - `public name` (string): The unique identifier for the agent instance.
  - `public intervalMs` (number, optional): Override the default 60s interval.
- **Method**: `public tick()` returning `Promise<void>`.

## 8. Usage & Triggering

The Runtime auto-scans the `src/agent` folder of every module. Registration is automatic.

### Queuing a Job via Global SDK

To trigger a processor, use the global `api` client. Always specify the `system` actor for background-initiated jobs.

```typescript
import { api } from '@/lib/api/api';

// Payload must match the processor's Zod schema
await api.orchestrator.job.create({
  type: 'scrape.url',
  payload: JSON.stringify({ url: 'https://example.com' }),
  actorId: 'system',
  actorType: 'system',
  status: 'PENDING',
  progress: 0,
  logs: '[]',
});
```
