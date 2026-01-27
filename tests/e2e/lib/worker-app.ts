
import { test as base } from '@playwright/test';
import { Client, Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { spawn, type ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Factory } from '@tests/integration/lib/factory';
import { PrismaClient } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Interface for the fixture
export interface WorkerApp {
    url: string;
    dbName: string;
}

// Logic to create the fixture
export const workerAppFixture = async ({ }, use: any, workerInfo: any) => {
    // 1. Generate Unique Identifiers
    const workerIndex = workerInfo.workerIndex;
    const dbName = `test_worker_${workerIndex}`;
    // Start ports from 4000 (app default is 4321, let's avoid it)
    const port = 4000 + workerIndex;
    const appUrl = `http://127.0.0.1:${port}`;

    // 2. Prepare Database
    const baseDbUrl = process.env.DATABASE_URL;
    if (!baseDbUrl) throw new Error('DATABASE_URL not set');
    const urlObj = new URL(baseDbUrl);
    urlObj.pathname = '/postgres';
    const adminUrl = urlObj.toString();

    const client = new Client({ connectionString: adminUrl });
    await client.connect();

    try {
        // Drop if exists (cleanup from previous crash)
        await client.query(`DROP DATABASE IF EXISTS ${dbName} WITH (FORCE)`);
        // Clone from template
        await client.query(`CREATE DATABASE ${dbName} TEMPLATE test_template`);
    } catch (e) {
        console.error(`[Worker ${workerIndex}] Failed to create DB ${dbName}`, e);
        throw e;
    } finally {
        await client.end();
    }

    // 3. Spawn Application
    urlObj.pathname = `/${dbName}`;
    const workerDbUrl = urlObj.toString();
    const serverEntry = path.join(process.cwd(), 'dist/server/entry.mjs');

    if (!fs.existsSync(serverEntry)) {
        throw new Error('Server build not found. Did global-setup run "npm run build"?');
    }

    // 4. Connect Test Process to Worker DB (using Adapter)
    const pool = new Pool({ connectionString: workerDbUrl });
    const adapter = new PrismaPg(pool);
    const workerClient = new PrismaClient({ adapter });
    Factory.setClient(workerClient);

    let appProcess: ChildProcess | null = null;
    try {
        appProcess = spawn('node', [serverEntry], {
            env: {
                ...process.env,
                DATABASE_URL: workerDbUrl,
                PORT: port.toString(),
                HOST: '127.0.0.1',
                // Important: Disable any other listeners or debuggers
                NODE_ENV: 'development',
                MOCK_EMAIL: 'true'
            },
            // Silence stdout/stderr to fix verbosity complaint.
            // On failure, we might want to capture this, but for now let's respect the "dot" reporter.
            stdio: 'inherit',
            detached: false
        });

        // 5. Wait for Readiness
        await waitForServer(appUrl, 30000);

        // 6. Use Fixture
        await use({
            url: appUrl,
            dbName: dbName
        });

    } finally {
        // 7. Teardown

        // Disconnect test client
        await workerClient.$disconnect();

        if (appProcess) {
            appProcess.kill();
        }

        // Cleanup DB
        const cleanupClient = new Client({ connectionString: adminUrl });
        await cleanupClient.connect();
        try {
            await cleanupClient.query(`
                SELECT pg_terminate_backend(pg_stat_activity.pid)
                FROM pg_stat_activity
                WHERE pg_stat_activity.datname = '${dbName}'
                AND pid <> pg_backend_pid();
            `);
            await cleanupClient.query(`DROP DATABASE IF EXISTS ${dbName}`);
        } catch (e) {
            console.error(`[Worker ${workerIndex}] Failed to drop DB ${dbName}`, e);
        } finally {
            await cleanupClient.end();
        }
    }
};

async function waitForServer(url: string, timeout: number) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        try {
            const res = await fetch(url);
            if (res.ok || res.status === 404) { // 404 is fine, means server is reachable
                return;
            }
        } catch (e) {
            // Wait and retry
        }
        await new Promise(r => setTimeout(r, 500));
    }
    throw new Error(`Server at ${url} did not start within ${timeout}ms`);
}
