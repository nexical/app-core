
import { ShellRegistry } from '@/lib/registries/shell-registry';
import { HeadRegistry } from '@/lib/registries/head-registry';
import { AuthShell } from './components/shell/auth-shell';

/**
 * Initialize the User Module.
 * Isomorphic: Runs on both Server and Client.
 * - Server: Registers Services, Emails, Hooks.
 * - Client: Registers Shells (and potentially client-side hooks).
 */
export async function initUserModule() {
    // 1. Register Auth Shell (Shared)
    // Works in both environments so Layout (SSR) and Client can find it.
    ShellRegistry.register('auth', AuthShell, (ctx) => {
        const path = ctx.url.pathname;
        return ['/login', '/register', '/forgot-password', '/verify-email'].some(p => path.startsWith(p));
    });

    // 2. Register Global Head Items (Example)
    HeadRegistry.register({
        tag: 'meta',
        props: { name: 'application-name', content: 'Nexus' },
        key: 'app-name'
    });
}

// Run initialization immediately
initUserModule();
