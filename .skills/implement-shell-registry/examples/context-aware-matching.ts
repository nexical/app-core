import type { ShellContext } from '@/lib/ui/nav-context';
import { ShellRegistry } from './shell-registry-implementation';

/**
 * Example: Selection with Typed Context
 * Selection uses strongly-typed Context interfaces for logic.
 */

// 1. Defining Registration with Matchers (Globs and Predicates)

// Glob: Matches any admin URL
ShellRegistry.register('admin-shell', AdminShell, '/admin/*');

// Predicate: Matches if a specific navigation data flag is set
ShellRegistry.register('kiosk-shell', KioskShell, (ctx) => {
  return ctx.navData.mode === 'kiosk' || ctx.url.searchParams.has('kiosk');
});

// Exact Match: Matches only the login page
ShellRegistry.register('auth-shell', AuthShell, '/login');

// 2. Selection based on current Request context

const currentContext: ShellContext = {
  url: new URL('https://app.nexical.com/admin/settings'),
  navData: { mode: 'standard' },
  isMobile: false,
};

// Returns AdminShell due to the '/admin/*' matcher
export const activeShell = ShellRegistry.select(currentContext);

/**
 * LIFO Priority Demonstration:
 * If a new module registers an 'admin-override-shell' with the same name,
 * it will be selected instead of the original 'admin-shell'.
 */

ShellRegistry.register('admin-shell', OverrideAdminShell, '/admin/*');

// Returns OverrideAdminShell (LIFO selection)
export const newActiveShell = ShellRegistry.select(currentContext);
