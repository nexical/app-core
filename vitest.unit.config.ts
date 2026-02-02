import { getViteConfig } from 'astro/config';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default getViteConfig({
  plugins: [tsconfigPaths({ projects: ['./tsconfig.json'] })],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/unit/setup.ts'],
    include: [
      'tests/unit/**/*.test.{ts,tsx}',
      'modules/**/tests/unit/**/*.test.{ts,tsx}',
      'packages/**/tests/unit/**/*.test.{ts,tsx}',
    ],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.agent/**'],
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/**/*.ts',
        'src/**/*.tsx',
        'modules/*/src/**/*.ts',
        'modules/*/src/**/*.tsx',
        'packages/*/src/**/*.ts',
        'packages/*/src/**/*.tsx',
      ],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/init.ts',
        'src/env.d.ts',
        'src/types/**',
        'src/pages/api/**',
        '**/node_modules/**',
        'modules/**/pages/api/**',
        'modules/**/services/**',
        'modules/**/sdk/**',
        'packages/sdk/**',
        '**/index.ts',
        '**/types.ts',
        '**/contracts.ts',
        '**/middleware.ts',
        '**/server-init.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    testTimeout: 30000,
    server: {
      deps: {
        inline: [/@radix-ui\/.*/, /@tanstack\/.*/, 'lucide-react'],
      },
    },
  },
  resolve: {
    alias: {
      // '@': path.resolve(__dirname, 'src'), // Handled by tsconfigPaths
      '@radix-ui/react-slot': path.resolve(__dirname, 'tests/unit/mocks/ui/radix-slot.tsx'),
      'astro:middleware': path.resolve(__dirname, 'tests/unit/mocks/astro.ts'),
      'astro:actions': path.resolve(__dirname, 'tests/unit/mocks/astro.ts'),
      'astro:schema': path.resolve(__dirname, 'tests/unit/mocks/astro.ts'),
    },
  },
});
