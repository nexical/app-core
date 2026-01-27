import { beforeAll, beforeEach, afterAll } from 'vitest';
import { TestServer } from './lib/server';
import { Factory } from './lib/factory';

// Start the server manager before all tests
beforeAll(async () => {
    await TestServer.start();
});

// Clean the DB before each test to ensure isolation
beforeEach(async () => {
    await Factory.clean();
});

// Stop the server after all tests are done
afterAll(async () => {
    await TestServer.stop();
});
