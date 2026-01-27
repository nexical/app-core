import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
        fileParallelism: false,
        environment: 'node',
        globals: true,
        setupFiles: ['./tests/integration/setup.ts'],
        include: [
            'tests/integration/**/*.test.{ts,tsx}',
            'modules/**/tests/integration/**/*.test.{ts,tsx}'
        ],
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            'packages/agent/tests/integration/**' // Moved to agent config
        ],
        testTimeout: 120000,
        hookTimeout: 120000,
        pool: 'forks',
    },
    resolve: {
        alias: {
            'astro:schema': 'zod',
            '@tests': './tests',
            '@modules': './modules',
            '@': './src',
        },
    },
});
