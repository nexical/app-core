import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    // Override root setupFiles if they don't apply, or fix the path
    setupFiles: [],
  },
  resolve: {
    alias: {
      '@modules': path.resolve(__dirname, '../../modules'),
      '@nexical/sdk': path.resolve(__dirname, '../../node_modules/@nexical/sdk'), // fallback
    },
  },
});
