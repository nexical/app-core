// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  _comment:
    "This config was generated using 'stryker init'. Please see the guide for more information: https://stryker-mutator.io/docs/stryker-js/guides/react",
  testRunner: 'vitest',
  reporters: ['progress', 'clear-text', 'html'],
  coverageAnalysis: 'off',
  concurrency: 1,
  logLevel: 'info',
  mutate: [
    'src/**/*.{ts,tsx}',
    'modules/*/src/**/*.{ts,tsx}',
    'packages/*/src/**/*.{ts,tsx}',
    '!src/lib/core/glob-helper.ts',
    '!src/lib/registries/middleware-registry.ts',
    '!src/lib/ui/registry-loader.ts',
    '!**/server-init.ts',
    '!**/node_modules/**',
  ],
  vitest: {
    configFile: 'vitest.unit.config.ts',
  },
};
export default config;
