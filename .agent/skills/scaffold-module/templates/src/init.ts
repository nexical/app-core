import { ShellRegistry } from '@/lib/registries/shell-registry';
import { HeadRegistry } from '@/lib/registries/head-registry';

/**
 * Module initialization.
 * Runs on both Server and Client.
 */
export async function init() {
  // 1. Register Shell Overrides
  // ShellRegistry.register('custom', MyShell, (ctx) => ctx.url.pathname === '/custom');

  // 2. Register Global Head Items
  HeadRegistry.register({
    tag: 'meta',
    props: { name: 'feature-flag', content: 'enabled' },
    key: 'my-feature-flag',
  });
}

// Auto-execute
init();
