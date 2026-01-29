
import { getViteConfig } from 'astro/config';
import path from 'path';

export default getViteConfig({
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
        server: {
            deps: {
                inline: [
                    /@radix-ui\/.*/,
                    /@tanstack\/.*/,
                    'lucide-react'
                ]
            }
        }
    },
    resolve: {
        alias: [
            { find: '@', replacement: path.resolve(process.cwd(), 'src') },
            // Fix for @radix-ui/react-slot resolution issue by mocking it if necessary
            { find: '@radix-ui/react-slot', replacement: path.resolve(process.cwd(), 'tests/unit/mocks/ui/radix-slot.tsx') },

            // Mocks for Astro virtual modules
            { find: 'astro:middleware', replacement: path.resolve(process.cwd(), 'tests/unit/mocks/astro.ts') },
            { find: 'astro:actions', replacement: path.resolve(process.cwd(), 'tests/unit/mocks/astro.ts') },
            { find: 'astro:schema', replacement: path.resolve(process.cwd(), 'tests/unit/mocks/astro.ts') },
        ],
    },
});
