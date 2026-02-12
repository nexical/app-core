/* eslint-disable */
import { spawn, type ChildProcess } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';

const TEST_PORT = 4322;
const TEST_HOST = 'localhost';
const TEST_URL = `http://${TEST_HOST}:${TEST_PORT}`;

export class ServerManager {
  private static instance: ServerManager;
  private serverProcess: ChildProcess | null = null;
  private isRunning = false;
  private currentUrl: string = `http://${TEST_HOST}:${TEST_PORT}`;

  private constructor() {}

  public static getInstance(): ServerManager {
    if (!ServerManager.instance) {
      ServerManager.instance = new ServerManager();
    }
    return ServerManager.instance;
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Server is already running.');
      return;
    }

    console.log('Starting Test Server...');

    let port: number;
    try {
      port = await this.getFreePort();
      console.log(`Found free port: ${port}`);
    } catch (e) {
      console.error('Failed to find free port, falling back to default', e);
      port = TEST_PORT;
    }

    // Set URL based on allocated port
    this.currentUrl = `http://${TEST_HOST}:${port}`;

    const env = { ...process.env };
    env.NODE_ENV = 'test';
    env.PORT = String(port);

    const envTestPath = path.resolve(process.cwd(), '.env.test');
    if (fs.existsSync(envTestPath)) {
      console.log('Loading environment from .env.test');
      dotenv.config({ path: envTestPath, override: true });
    } else {
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        console.log('Loading environment from .env (fallback)');
        dotenv.config({ path: envPath, override: true });
      }
    }

    // Auth.js/NextAuth requires this in non-dev environments for localhost
    env.AUTH_TRUST_HOST = 'true';
    env.AUTH_URL = `${this.currentUrl}`;
    env.PUBLIC_SITE_URL = `${this.currentUrl}`;
    env.AUTH_API_PREFIX = '/api/auth';

    if (!process.env.AUTH_SECRET && !env.AUTH_SECRET) {
      console.warn('WARNING: AUTH_SECRET is not set. Auth will likely fail.');
    } else {
      console.log('AUTH_SECRET is set.');
    }

    // Merge envs.
    const spawnEnv = { ...process.env, ...env };

    let astroPath = path.resolve(process.cwd(), 'node_modules/astro/astro.js');
    if (!fs.existsSync(astroPath)) {
      // Try root node_modules if in a workspace
      astroPath = path.resolve(process.cwd(), '../node_modules/astro/astro.js');
    }
    if (!fs.existsSync(astroPath)) {
      // Try one more level up just in case (e.g. apps/backend)
      astroPath = path.resolve(process.cwd(), '../../node_modules/astro/astro.js');
    }

    if (!fs.existsSync(astroPath)) {
      console.error(`Could not find astro.js at ${astroPath}`);
      throw new Error('Astro binary not found. Ensure dependencies are installed.');
    }

    console.log(`Spawning Astro from: ${astroPath}`);

    this.serverProcess = spawn(
      'node',
      [astroPath, 'dev', '--port', String(port), '--host', TEST_HOST],
      {
        env: spawnEnv,
        cwd: process.cwd(),
        stdio: 'pipe',
        detached: true,
      },
    );

    this.serverProcess.on('error', (err) => {
      console.error(`[Server Spawn Error]: ${err.message}`);
    });

    this.serverProcess.on('exit', (code, signal) => {
      console.log(`[Server Exit]: code ${code}, signal ${signal}`);
    });

    if (this.serverProcess.stdout) {
      this.serverProcess.stdout.on('data', (data) => {
        const msg = data.toString();
        // Console log removed to reduce noise, unless DEBUG
        if (process.env.DEBUG) console.log(`[Server Output]: ${msg}`);
      });
    }

    if (this.serverProcess.stderr) {
      this.serverProcess.stderr.on('data', (data) => {
        const msg = data.toString();
        console.error(`[Server Error]: ${msg}`);
      });
    }

    try {
      await this.waitForServer();
      this.isRunning = true;
      console.log(`Test Server is running at ${this.currentUrl}`);
    } catch (e) {
      console.error('Test Server failed to start:', e);
      await this.stop();
      throw e;
    }
  }

  private async getFreePort(): Promise<number> {
    return new Promise((resolve, reject) => {
      const server = require('net').createServer();
      server.unref();
      server.on('error', reject);
      server.listen(0, () => {
        const port = (server.address() as any).port;
        server.close(() => {
          resolve(port);
        });
      });
    });
  }

  public async stop(): Promise<void> {
    if (this.serverProcess) {
      console.log('Stopping Test Server...');
      // Kill the process group to ensure child processes (vite/astro) are also killed
      if (this.serverProcess.pid) {
        try {
          process.kill(-this.serverProcess.pid, 'SIGTERM');
        } catch (e: any) {
          // ESRCH means process doesn't exist, which is fine
          if (e.code !== 'ESRCH') {
            try {
              this.serverProcess.kill('SIGTERM');
            } catch (inner) {
              console.error('Failed to kill server process:', inner);
            }
          }
        }
      }

      this.serverProcess = null;
      this.isRunning = false;
    }
  }

  public getUrl(): string {
    return this.currentUrl;
  }

  private async waitForServer(): Promise<void> {
    const timeoutMs = 120000; // 120s
    const startTime = Date.now();
    const interval = 500;

    while (Date.now() - startTime < timeoutMs) {
      try {
        const res = await fetch(`${this.currentUrl}/api/status`);
        if (process.env.DEBUG)
          console.log(`[Polling] ${this.currentUrl}/api/status -> ${res.status}`);
        if (res.ok) {
          return;
        }
      } catch (e) {
        if (process.env.DEBUG) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`[Polling] ${this.currentUrl}/api/status -> ${msg}`);
        }
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    throw new Error(`Server failed to start within ${timeoutMs}ms.`);
  }
}

export const TestServer = ServerManager.getInstance();
