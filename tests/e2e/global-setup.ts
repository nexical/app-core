/* eslint-disable no-console */
import { execSync } from 'child_process';
import { Client } from 'pg';

async function globalSetup() {
  console.log('Global Setup: Starting Parallel Test Infrastructure...');

  // 1. Build the Application
  if (process.env.TEST_SKIP_BUILD) {
    console.log('Global Setup: Skipping build (TEST_SKIP_BUILD is set)...');
  } else {
    console.log('Global Setup: Building application for production...');
    try {
      // We use stdio: inherit to show build progress
      execSync('npm run build', {
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'test' },
      });
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
      env: { ...process.env, DATABASE_URL: templateDbUrl, NODE_ENV: 'test' },
      stdio: 'inherit',
    });

    console.log('Global Setup: Seeding test_template...');
    execSync('npx prisma db seed', {
      env: { ...process.env, DATABASE_URL: templateDbUrl, NODE_ENV: 'test' },
      stdio: 'inherit',
    });
  } catch (e) {
    console.error('Global Setup: Failed to setup template database');
    throw e;
  }

  console.log('Global Setup: Infrastructure Ready.');
}

export default globalSetup;
