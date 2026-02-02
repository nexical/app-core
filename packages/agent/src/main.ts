import 'dotenv/config';

import { jobProcessors, processors as persistentProcessors } from './registry.js';
import { AgentClient } from './networking/client.js';
import { JobExecutor } from './runtime/executor.js';
import { JobPoller } from './runtime/poller.js';
import { AgentSupervisor } from './runtime/supervisor.js';
import type { JobProcessor } from './core/processor.js';

// Configuration
const AGENT_API_TOKEN = process.env.AGENT_API_TOKEN;
const AGENT_API_URL = process.env.AGENT_API_URL || 'http://localhost:4321/api';

// Parse Args
const args = process.argv.slice(2);
const processorArgIndex = args.indexOf('--processor');
const processorName = processorArgIndex !== -1 ? args[processorArgIndex + 1] : null;

// Help
if (args.includes('-h') || args.includes('--help')) {
  console.info(`
Nexus Agent - Orchestrator Worker

Usage:
  agent [options]

Options:
  --processor [name]   Run a specific persistent processor (internal use)

Description:
  Runs a long-polling agent that executes jobs from the Nexus Orchestrator.
  Also manages persistent agent processors as subprocesses.

Configuration (Environment Variables):
  AGENT_API_TOKEN (Required)
  AGENT_API_URL (Optional)
`);
  process.exit(0);
}

// Validation
if (!AGENT_API_TOKEN) {
  console.error('FATAL: AGENT_API_TOKEN is not defined. Use --help for more info.');
  process.exit(1);
}

// Mode Selection
if (processorName) {
  // Mode 1: Processor Mode
  startProcessor(processorName);
} else {
  // Mode 2: Supervisor Mode
  startSupervisor().catch((err) => {
    console.error('FATAL: Supervisor failed to start:', err);
    process.exit(1);
  });
}

async function startProcessor(name: string) {
  const ProcessorClass = persistentProcessors[name];
  if (!ProcessorClass) {
    console.error(`FATAL: Processor ${name} not found in registry.`);
    process.exit(1);
  }

  try {
    const agent = new ProcessorClass();

    // Handle Shutdown
    process.on('SIGTERM', () => {
      agent.stop();
      process.exit(0);
    });

    await agent.start(); // Should loop forever
  } catch (err) {
    console.error(`FATAL: Processor ${name} crashed:`, err);
    process.exit(1);
  }
}

async function startSupervisor() {
  // 1. Start Supervisor (Persistent Processors)
  const supervisor = new AgentSupervisor(persistentProcessors);
  supervisor.start();

  // 2. Initialize Job Processors
  console.info('[DEBUG] Loading processors from registry:', jobProcessors);
  const initializedProcessors: Record<string, JobProcessor<unknown>> = {};
  for (const [key, ProcessorClass] of Object.entries(jobProcessors)) {
    const pClass = ProcessorClass as new (config: unknown) => JobProcessor<unknown>;
    initializedProcessors[key] = new pClass({
      apiUrl: AGENT_API_URL,
      apiToken: AGENT_API_TOKEN!,
    });
  }

  // 3. Start Job Poller (in this process)
  const client = new AgentClient({
    apiUrl: AGENT_API_URL,
    apiToken: AGENT_API_TOKEN!,
  });

  // Register Agent
  const capabilities = Object.keys(initializedProcessors);
  await client.register({
    id: process.env.AGENT_ID,
    hostname: process.env.AGENT_HOSTNAME || 'localhost',
    capabilities,
  });

  const executor = new JobExecutor({
    apiUrl: AGENT_API_URL,
    apiToken: AGENT_API_TOKEN!,
  });

  const poller = new JobPoller(client, executor, initializedProcessors, process.env.AGENT_ID);
  poller.start();

  // Handle Shutdown
  process.on('SIGINT', async () => {
    poller.stop();
    await supervisor.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    poller.stop();
    await supervisor.shutdown();
    process.exit(0);
  });
}
