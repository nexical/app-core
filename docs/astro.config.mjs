// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
import sidebarModules from './src/sidebar-modules.json';

export default defineConfig({
  site: 'https://nexical.github.io',
  base: '/app-core',
  integrations: [
    starlight({
      title: 'Nexical Ecosystem',
      logo: {
        src: './src/assets/logo.svg',
      },
      favicon: '/favicon.svg',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/nexical/app-core' }],
      sidebar: [
        {
          label: 'Architecture',
          autogenerate: { directory: 'architecture' },
        },
        {
          label: 'Module Development',
          autogenerate: { directory: 'module-dev' },
        },
        {
          label: 'Core API',
          autogenerate: { directory: 'core-api' },
        },
        {
          label: 'Guides',
          autogenerate: { directory: 'guides' },
        },
        {
          label: 'UI System',
          autogenerate: { directory: 'ui' },
        },
        {
          label: 'Modules',
          items: sidebarModules,
        },
      ],
    }),
  ],
});
