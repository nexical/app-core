import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
    plugins: [react(), tsconfigPaths({ ignoreConfigErrors: true })],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/unit/setup.ts'],
        include: [
            'tests/unit/**/*.test.{ts,tsx}',
            'modules/**/tests/unit/**/*.test.{ts,tsx}',
            'packages/**/tests/unit/**/*.test.{ts,tsx}'
        ],
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/.agent/**'
        ],
        coverage: {
            enabled: true,
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.ts', 'src/**/*.tsx', 'modules/*/src/**/*.ts', 'modules/*/src/**/*.tsx'],
            exclude: [
                'src/**/*.d.ts',
                'src/**/*.test.ts',
                'src/**/*.test.tsx',
                'src/env.d.ts',
                'src/types/**',
                '**/node_modules/**'
            ],
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 80,
                statements: 80
            }
        },
        testTimeout: 30000,
    },
    resolve: {
        alias: [
            { find: /^@\/(.*)/, replacement: path.resolve(__dirname, 'src/$1') },
            { find: /^@modules\/(.*)/, replacement: path.resolve(__dirname, 'modules/$1') },
            { find: /^@tests\/(.*)/, replacement: path.resolve(__dirname, 'tests/$1') },
            { find: /^@nexical\/agent\/(.*)/, replacement: path.resolve(__dirname, 'packages/agent/$1') },
            { find: /^@nexical\/sdk\/(.*)/, replacement: path.resolve(__dirname, 'packages/sdk/$1') },
            // Fallback for direct package imports (e.g. '@nexical/sdk')
            { find: /^@nexical\/sdk$/, replacement: path.resolve(__dirname, 'packages/sdk/src/index.ts') },
            { find: /^@nexical\/agent$/, replacement: path.resolve(__dirname, 'packages/agent/src/main.ts') },
            // Mocks for Astro virtual modules
            { find: 'astro:middleware', replacement: path.resolve(__dirname, 'tests/unit/mocks/astro.ts') },
            { find: 'astro:actions', replacement: path.resolve(__dirname, 'tests/unit/mocks/astro.ts') },
        ],
    },
});
