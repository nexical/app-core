import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defu } from 'defu';
import node from '@astrojs/node';
import modulePages from './src/lib/integrations/module-pages-integration.ts';

import moduleEmailTheme from './src/lib/integrations/module-email-theme-integration.ts';

import moduleStyles from './src/lib/integrations/module-styles-integration.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Modular Config Discovery
import { ModuleDiscovery } from './src/lib/modules/module-discovery.ts';

let moduleIntegrations = [];
let moduleViteConfig = {};

const loadedModules = await ModuleDiscovery.loadModules();
for (const module of loadedModules) {
  const { config } = module;
  if (config.integrations) moduleIntegrations.push(...config.integrations);
  if (config.vite) moduleViteConfig = defu(moduleViteConfig, config.vite);
}

// Resolve Output Mode
const isStatic = process.env.PUBLIC_SITE_MODE === 'static';

// https://astro.build/config
export default defineConfig({
  output: isStatic ? 'static' : 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [react(), modulePages(), moduleEmailTheme(), moduleStyles(), ...moduleIntegrations],
  devToolbar: {
    enabled: process.env.ASTRO_DEV_TOOLBAR === 'true',
  },

  vite: defu(moduleViteConfig, {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: process.env.ALLOWED_HOSTS
        ? process.env.ALLOWED_HOSTS.split(',')
        : ['web', 'localhost'],
      watch: {
        ignored:
          process.env.NODE_ENV === 'test'
            ? ['**/*']
            : [
                '**/.git/**',
                '**/node_modules/**',
                '**/dist/**',
                '**/packages/**',
                '**/.agent/**',
                '**/scripts/**',
                '**/tests/**',
                '**/db/**',
                '**/tmp/**',
                '**/*.txt',
                '**/*.log',
              ],
      },
    },
    build: {
      chunkSizeWarningLimit: 4000,
      rollupOptions: {
        external: [
          /^node:/,
          'jiti',
          'nodemailer',
          'net',
          'tls',
          'fs',
          'path',
          'stream',
          'util',
          'url',
          'crypto',
          'dns',
          'http',
          'https',
          'zlib',
          'events',
          'pg-connection-string',
          'pgpass',
          'dotenv',
          'os',
          '.prisma/client/index-browser',
        ],
      },
    },
    resolve: {
      extensionAlias: {
        '.js': ['.ts', '.js'],
      },
    },
    ssr: {
      noExternal: [/^@nexical\//, /modules\/.*\/src\/sdk/],
      external: [
        'react',
        'react-dom',
        'jiti',
        'nodemailer',
        'bcryptjs',
        'crypto',
        'path',
        'fs',
        'stream',
        'util',
        'url',
        'dns',
        'http',
        'https',
        'zlib',
        'events',
        'pg-connection-string',
        'pgpass',
        'dotenv',
        'os',
      ],
    },
  }),
});
