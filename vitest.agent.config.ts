import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    fileParallelism: false, // Agents often touch the same DB or resources, safer to run serially or control carefully
    environment: 'node',
    globals: true,
    // We reuse integration setup for database/auth if needed by agents
    setupFiles: ['./tests/integration/setup.ts'],
    include: [
      'modules/**/tests/agents/**/*.test.{ts,tsx}',
      'packages/agent/tests/integration/**/*.test.{ts,tsx}',
    ],
    testTimeout: 120000,
    hookTimeout: 120000,
    pool: 'forks',
  },
  resolve: {
    alias: [
      { find: 'astro:schema', replacement: 'zod' },
      { find: /^@\/(.*)/, replacement: path.resolve(__dirname, 'src/$1') },
      { find: /^@modules\/(.*)/, replacement: path.resolve(__dirname, 'modules/$1') },
      { find: /^@tests\/(.*)/, replacement: path.resolve(__dirname, 'tests/$1') },
      { find: /^@nexical\/agent\/(.*)/, replacement: path.resolve(__dirname, 'packages/agent/$1') },
      { find: /^@nexical\/sdk\/(.*)/, replacement: path.resolve(__dirname, 'packages/sdk/$1') },
      // Fallback for direct package imports (e.g. '@nexical/sdk')
      {
        find: /^@nexical\/sdk$/,
        replacement: path.resolve(__dirname, 'packages/sdk/src/index.ts'),
      },
      {
        find: /^@nexical\/agent$/,
        replacement: path.resolve(__dirname, 'packages/agent/src/main.ts'),
      },
    ],
  },
});
