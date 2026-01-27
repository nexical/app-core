import { ShellRegistry } from '@/lib/registries/shell-registry';
import { AppShellDesktop } from '@/components/shell/app-shell-desktop';
import { AppShellMobile } from '@/components/shell/app-shell-mobile';

// Register Platform-Specific Shells
ShellRegistry.register('mobile', AppShellMobile, (ctx) => ctx.isMobile);
ShellRegistry.register('desktop', AppShellDesktop, (ctx) => !ctx.isMobile);

console.log('[Core] Initialized.');
