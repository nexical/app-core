import { ShellRegistry } from '@/lib/registries/shell-registry';
import { AppShellDesktop } from '@/components/shell/app-shell-desktop';
import { AppShellMobile } from '@/components/shell/app-shell-mobile';

import { ApiDocsShell } from '@/components/shell/api-docs-shell.tsx';

// Register Platform-Specific Shells
ShellRegistry.register('mobile', AppShellMobile, (ctx) => ctx.isMobile);
ShellRegistry.register('desktop', AppShellDesktop, (ctx) => !ctx.isMobile);

// Override for API Docs
ShellRegistry.register('api-docs', ApiDocsShell, (ctx) => ctx.url.pathname.startsWith('/api/docs'));

console.log('[Core] Initialized.');
