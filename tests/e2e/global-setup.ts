import { execSync } from 'child_process';
import { Client } from 'pg';

async function globalSetup() {
    console.log('Global Setup: Starting Parallel Test Infrastructure...');

    // 1. Build the Application
    // Optimization: Skip build if running in single worker mode (dev speedup assumption)
    // Wait, we need the build for 'spawn'. Without a build, we can't spawn 'dist/server/entry.mjs'.
    // The user's compliant was about slowness.
    // If we want to use 'npm run dev' strategies for single worker, we would need to revert to webServer config.
    // BUT, we want consistent behavior.
    // Let's at least check if build exists and is recent? No, safer to just build.
    // Okay, the user said it's SLOWER than before.
    // Before: webServer ran 'npm run dev' which uses Vite dev server (very fast startup).
    // Now: We run 'npm run build' (slow) then spawn node.

    // To fix this for local dev (1 worker), we should maybe rely on 'npm run dev'?
    // But 'npm run dev' doesn't support easy dynamic database switching via env var *per request* easily without
    // complex middleware.
    // The current architecture REQUIRES a build because we are spawning per-worker processes with injected env vars.

    // Compromise: We can check if 'dist' exists and skip build if TEST_SKIP_BUILD is set,
    // or just assume for now we must build.
    // Let's optimize by checking if we really need to rebuild? No, source might have changed.

    // Environment variable to skip build for faster local iteration
    // Usage: TEST_SKIP_BUILD=true npx playwright test
    if (process.env.TEST_SKIP_BUILD) {
        console.log('Global Setup: Skipping build (TEST_SKIP_BUILD is set)...');
    } else {
        console.log('Global Setup: Building application for production...');
        try {
            // We use stdio: inherit to show build progress
            execSync('npm run build', { stdio: 'inherit' });
        } catch (e) {
            console.error('Global Setup: Build Failed!');
            throw e;
        }
    }

    // 2. Create Template Database
    console.log('Global Setup: Creating Template Database (test_template)...');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        throw new Error('DATABASE_URL environment variable is not set');
    }

    // Parse DB URL to connect to 'postgres' (admin) database
    // Assumption: DATABASE_URL format is postgresql://user:pass@host:port/dbname
    const urlObj = new URL(dbUrl);
    urlObj.pathname = '/postgres'; // Connect to default admin DB
    const adminUrl = urlObj.toString();

    // Connect to create the template DB
    const client = new Client({ connectionString: adminUrl });
    await client.connect();

    try {
        // Terminate any existing connections to the template DB if it exists (cleanup)
        await client.query(`
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = 'test_template'
            AND pid <> pg_backend_pid();
        `);

        await client.query('DROP DATABASE IF EXISTS test_template');
        await client.query('CREATE DATABASE test_template');
    } catch (e) {
        console.error('Global Setup: Failed to create template database');
        throw e;
    } finally {
        await client.end();
    }

    // 3. Push Schema to Template Database
    console.log('Global Setup: Pushing schema to test_template...');
    // Construct URL for the new template DB
    urlObj.pathname = '/test_template';
    const templateDbUrl = urlObj.toString();

    try {
        execSync('npx prisma db push', {
            env: { ...process.env, DATABASE_URL: templateDbUrl },
            stdio: 'inherit'
        });

        console.log('Global Setup: Seeding test_template...');
        execSync('npx prisma db seed', {
            env: { ...process.env, DATABASE_URL: templateDbUrl },
            stdio: 'inherit'
        });

    } catch (e) {
        console.error('Global Setup: Failed to setup template database');
        throw e;
    }

    console.log('Global Setup: Infrastructure Ready.');
}

export default globalSetup;
