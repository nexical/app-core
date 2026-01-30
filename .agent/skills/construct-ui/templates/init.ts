import { ShellRegistry } from '@/lib/registries/shell-registry';
import { HeadRegistry } from '@/lib/registries/head-registry';
import { FooterRegistry } from '@/lib/registries/footer-registry';
// import { MyShell } from './components/my-shell';
// import { MyFooter } from './components/my-footer';

/**
 * Module Initialization Template
 *
 * Rules:
 * - Naming: async function init{ModuleName}Module()
 * - Registers Shells, Head items, and Footers.
 * - Must include an immediate call at the bottom.
 */
export async function init__Name__Module() {
  // 1. Register Module-Specific Shells
  /*
    ShellRegistry.register(
        '__name__-shell', 
        MyShell, 
        (ctx) => ctx.url.pathname.startsWith('/__name__')
    );
    */

  // 2. Register Global Head Items
  HeadRegistry.register({
    tag: 'meta',
    props: { name: 'module-__name__-active', content: 'true' },
    key: 'module-__name__',
  });

  // 3. Register Contextual Footers
  /*
    FooterRegistry.register(
        '__name__-footer', 
        MyFooter, 
        '/__name__/*'
    );
    */
}

// CRITICAL: Immediate call for discovery
init__Name__Module();
