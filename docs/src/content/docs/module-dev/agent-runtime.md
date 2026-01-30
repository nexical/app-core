---
title: Agent Runtime
description: Background job processing and autonomous actors.
sidebar:
  order: 8
---

The Agent Runtime enables modules to perform asynchronous background processing.

## JobProcessor

Modules define processors extending the `JobProcessor` class.

### Definition

Place processors in `modules/{name}/src/agent/`.

```ts
// modules/scraper/src/agent/scrape-processor.ts
import { JobProcessor } from '@nexical/agent';

export class ScrapeProcessor extends JobProcessor<ScrapeInput> {
  jobType = 'scrape.url';

  async process(job) {
    // Logic
  }
}
```

## Lifecycle

1.  **Discovery**: The system auto-discovers files in `src/agent/`.
2.  **Registration**: Processors are registered to the worker pool.
3.  **Execution**: When a job of `jobType` is enqueued, the processor handles it.
