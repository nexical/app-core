import { defineConfig } from 'vitest/config';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [tsconfigPaths({ projects: ['./tsconfig.json'] })],
  test: {
    environment: 'jsdom',
    globals: true,
    env: {
      PUBLIC_API_URL: 'http://localhost:4321/api',
      PUBLIC_SITE_NAME: 'Nexical',
      PUBLIC_SITE_VERSION: '0.0.1',
    },
    setupFiles: ['./tests/unit/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/init.ts',
        'src/env.d.ts',
        'src/types/**',
        'src/pages/api/**',
        'src/lib/email/email-theme-config.ts',
        '**/node_modules/**',
        '**/index.ts',
        '**/types.ts',
        '**/contracts.ts',
        '**/middleware.ts',
        '**/server-init.ts',
        'src/lib/core/glob-helper.ts',
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
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
      '@': path.resolve(__dirname, 'src'),
      '@modules/user-ui/src/lib/auth-client': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-client.ts',
      ),
      '@modules/core-api/src/actions/schema-root': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/services/agent-api-key-service': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/create-agent-api-key': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/delete-agent-api-key': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/services/agent-service': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/heartbeat-agent': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/register-agent': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/agent-status': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/agent-api-key-status': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/services/dead-letter-job-service': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/services/job-log-service': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/services/job-service': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/cancel-job': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/complete-job': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/fail-job': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/retry-job': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/update-progress-job': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/start-job': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/stop-job': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/get-agent-metrics': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/get-job-metrics': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/check-stale-agents-orchestrator': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/start-orchestrator': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/stop-orchestrator': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/get-orchestrator-status': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/complete-all-jobs': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/fail-all-jobs': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/retry-all-jobs': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/services/job-metrics-service': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/get-orchestrator-metrics': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/poll-jobs-orchestrator': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/get-system-metrics': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/get-all-jobs': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/get-all-agents': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/services/invitation-service': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/services/team-service': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/actions/accept-invitation': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/actions/decline-invitation': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/actions/cancel-invitation': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/actions/create-invitation': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/services/team-api-key-service': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/services/team-member-service': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/actions/create-team-api-key': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/actions/delete-team-api-key': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/actions/update-team-api-key': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/actions/remove-team-member': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/actions/update-team-member': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/actions/update-team': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/actions/delete-team': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/actions/list-invitations-team-member': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/actions/invite-team-member': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/actions/delete-invitation-team-member': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/actions/resend-invitation-team-member': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/actions/get-team': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/actions/list-teams': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/actions/list-team-members': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/actions/list-team-api-keys': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/get-job-logs': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/get-job-details': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/orchestrator-api/src/actions/get-agent-details': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/actions/accept-invitation-team-member': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/actions/decline-invitation-team-member': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/actions/cancel-invitation-team-member': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/actions/create-team': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/actions/get-current-team': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/team-api/src/actions/list-team-invitations': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/user-api/src/actions/invite-user-auth': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/user-api/src/actions/login-auth': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/user-api/src/actions/logout-auth': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/user-api/src/actions/register-auth': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/user-api/src/actions/verify-email-auth': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/user-api/src/actions/reset-password-auth': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/user-api/src/actions/forgot-password-auth': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/user-api/src/actions/request-password-reset-auth': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/user-api/src/actions/validate-reset-token-auth': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/user-api/src/actions/update-password-auth': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/user-api/src/actions/get-me-user': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/user-api/src/actions/update-me-user': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/user-api/src/actions/delete-me-user': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/user-api/src/actions/list-tokens-user': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/user-api/src/actions/create-token-user': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/user-api/src/actions/delete-token-user': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/user-api/src/actions/get-token-user': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/user-api/src/actions/get-all-users': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/user-api/src/actions/get-user-by-id': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/user-api/src/services/user-service': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@modules/user-api/src/services/auth-service': path.resolve(
        __dirname,
        'tests/unit/mocks/auth-config.ts',
      ),
      '@radix-ui/react-slot': path.resolve(__dirname, 'tests/unit/mocks/ui/radix-slot.tsx'),
      'astro:middleware': path.resolve(__dirname, 'tests/unit/mocks/astro.ts'),
      'astro:actions': path.resolve(__dirname, 'tests/unit/mocks/astro.ts'),
      'astro:schema': path.resolve(__dirname, 'tests/unit/mocks/astro.ts'),
      'auth:config': path.resolve(__dirname, 'tests/unit/mocks/auth-config.ts'),
    },
  },
});
