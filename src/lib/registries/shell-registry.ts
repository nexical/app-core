import type { ComponentType, ReactNode } from 'react';

/**
 * Context provided to shell Matchers to decide if a shell should be active.
 */
export interface ShellContext {
  url: URL;
  navData: Record<string, unknown>;
  isMobile: boolean;
  width: number;
  height: number;
}

export type ShellComponent = ComponentType<{
  children: ReactNode;
  navData: Record<string, unknown>;
}>;

/**
 * A matcher can be:
 * - A string glob pattern (e.g. "/user/*", "*")
 * - A predicate function
 */
export type ShellMatcher = string | ((context: ShellContext) => boolean);

interface RegistryEntry {
  name: string;
  component: ShellComponent;
  matcher: ShellMatcher;
}

class ShellRegistryClass {
  private registry: Map<string, RegistryEntry> = new Map();

  /**
   * register a shell.
   * Uses a Map to prevent duplicates by name.
   * Iteration order is preserved (insertion order), so re-registering (delete+set) pushes to end.
   */
  register(name: string, component: ShellComponent, matcher: ShellMatcher) {
    // Delete first to ensure it moves to the end of the Map (LIFO priority for new overrides)
    if (this.registry.has(name)) {
      this.registry.delete(name);
    }
    this.registry.set(name, { name, component, matcher });
  }

  /**
   * Clear all registrations.
   */
  clear() {
    this.registry.clear();
  }

  /**
   * Find the best matching shell entry for the current context.
   * Iterates in REVERSE order (LIFO) so latest registrations win.
   */
  findEntry(context: ShellContext): RegistryEntry | undefined {
    const entries = Array.from(this.registry.values());
    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i];
      if (this.matches(entry.matcher, context)) {
        return entry;
      }
    }
    return undefined;
  }

  /**
   * Find the component directly.
   */
  find(context: ShellContext): ShellComponent | undefined {
    return this.findEntry(context)?.component;
  }

  /**
   * Get a shell by name.
   */
  get(name: string): ShellComponent | undefined {
    return this.registry.get(name)?.component;
  }

  private matches(matcher: ShellMatcher, context: ShellContext): boolean {
    if (typeof matcher === 'function') {
      return matcher(context);
    }

    if (typeof matcher === 'string') {
      // "wildcard" support
      if (matcher === '*') return true;

      const path = context.url.pathname;

      // Simple glob support
      // Ends with * (e.g. /user/*)
      if (matcher.endsWith('/*')) {
        const prefix = matcher.slice(0, -2);
        return path.startsWith(prefix);
      }
      // Starts with * (e.g. *.html) - unlikely for routes but possible
      if (matcher.startsWith('*')) {
        const suffix = matcher.slice(1);
        return path.endsWith(suffix);
      }

      // Exact match
      return path === matcher;
    }

    return false;
  }
}

export const ShellRegistry = new ShellRegistryClass();
