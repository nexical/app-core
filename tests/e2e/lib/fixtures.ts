/* eslint-disable */
import { test as base } from '@playwright/test';
import { Actor } from './actor';
import { TestUtils } from './utils';
import { type WorkerApp, workerAppFixture } from './worker-app';

// Declare the types of your fixtures.
type TestFixtures = {
  actor: Actor;
  utils: typeof TestUtils;
};

type WorkerFixtures = {
  workerApp: WorkerApp;
};

// Extend base test to include our fixtures.
export const test = base.extend<TestFixtures, WorkerFixtures>({
  // Worker-scoped fixture to setup App and DB
  workerApp: [workerAppFixture, { scope: 'worker' }],

  // Override baseURL to point to the worker-specific app
  baseURL: async ({ workerApp }, use) => {
    await use(workerApp.url);
  },

  actor: async ({ page, context }, use) => {
    // page base url is already set by the baseURL override above?
    // Playwright sets context/page baseURL from the project config OR the fixture override.
    // We verify this works.
    const actor = new Actor(page, context);
    await use(actor);
  },
  utils: async ({}, use) => {
    await use(TestUtils);
  },
});

export { expect } from '@playwright/test';
