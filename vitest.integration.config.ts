import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths({ projects: [path.resolve(__dirname, 'tsconfig.json')] })],
  root: __dirname,
  test: {
    fileParallelism: false,
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/integration/env-setup.ts', './tests/integration/setup.ts'],
    include: ['tests/integration/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    testTimeout: 120000,
    hookTimeout: 120000,
    pool: 'forks',
  },
  resolve: {
    alias: {
      'astro:schema': 'zod',
      '@tests': path.resolve(__dirname, './tests'),
      '@': path.resolve(__dirname, './src'),
    },
  },
});
