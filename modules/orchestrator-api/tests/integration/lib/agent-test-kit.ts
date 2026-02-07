import type { ChildProcess } from 'child_process';
import path from 'node:path';

export interface AgentSpawnerOptions {
  /**
   * Environment variables to inject into the agent process
   */
  env?: Record<string, string>;
  /**
   * Whether to pipe stdout/stderr to the parent process
   */
  silent?: boolean;
}

export class AgentSpawner {
  private process: ChildProcess | null = null;
  private agentPath: string;

  constructor() {
    // Resolve path to the compiled agent script
    // Assuming we are running from project root or module root
    this.agentPath = path.resolve(process.cwd(), 'packages/agent/src/main.ts');
  }

  /**
   * Spawns the agent process using ts-node/tsx to run the source directly during testing
   */
  async start(options: AgentSpawnerOptions = {}) {
    if (this.process) {
      throw new Error('Agent is already running');
    }

    const combinedEnv: Record<string, string | undefined> = {
      ...process.env,
      ...options.env,
      // Ensure we don't accidentally inherit production secrets unless specified
      AGENT_API_TOKEN: options.env?.AGENT_API_TOKEN || 'ne_team_test_key',
      AGENT_API_URL: options.env?.AGENT_API_URL || 'http://localhost:4321/api',
      NODE_ENV: 'development', // Ensure main() runs even if parent is in test mode
    };

    // Explicitly remove variables if they are set to empty string (to ensure they are undefined in child)
    if (options.env && options.env['GITHUB_TOKEN'] === '') {
      delete combinedEnv.GITHUB_TOKEN;
    }

    const env = combinedEnv as NodeJS.ProcessEnv;

    // Use tsx or ts-node to run the agent source
    // Use spawn to mimic manual run
    // Use tsx via npx to run the agent source (handles aliases better and supports fork)
    // Use tsx directly from node_modules to avoid npx signal propagation issues
    const nodeExecutable = path.resolve(process.cwd(), 'node_modules/.bin/tsx');

    // Spawn directly
    const { spawn } = await import('child_process');
    this.process = spawn(nodeExecutable, [this.agentPath], {
      env,
      stdio: ['ignore', 'pipe', 'pipe'], // No IPC
    });

    this.process.stdout?.on('data', async (data) => {
      console.info(`[Agent] ${data.toString().trim()}`);
      try {
        const fs = await import('node:fs');
        fs.appendFileSync('/tmp/agent-stdout.log', data.toString());
      } catch {
        // Ignore file write errors in tests
      }
    });

    this.process.stderr?.on('data', async (data) => {
      console.error(`[Agent ERR] ${data.toString().trim()}`);
      try {
        const fs = await import('node:fs');
        fs.appendFileSync('/tmp/agent-stderr.log', `[Stderr] ${data.toString()}`);
      } catch {
        // Ignore file write errors in tests
      }
    });

    this.process.on('exit', (code, signal) => {
      console.info(`[Agent] Exited with code ${code} signal ${signal}`);
    });

    this.process.on('error', (err) => {
      console.error(`[Agent] Spawn Error:`, err);
    });

    console.info(`[AgentSpawner] Started Agent (PID: ${this.process.pid})`);

    // Give it a moment to initialize
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async stop() {
    if (this.process) {
      console.info(`[AgentSpawner] Stopping Agent (PID: ${this.process.pid})...`);

      const exitPromise = new Promise((resolve) => {
        this.process?.on('exit', resolve);
      });

      this.process.kill('SIGTERM');

      // Wait up to 5 seconds for clean exit, then force kill
      const timeout = setTimeout(() => {
        this.process?.kill('SIGKILL');
      }, 5000);

      await exitPromise;
      clearTimeout(timeout);

      this.process = null;
    }
  }
}
