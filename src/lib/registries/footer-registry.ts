import type { ComponentType, ReactNode } from 'react';
import type { ShellContext, ShellMatcher } from './shell-registry';

export type FooterComponent = ComponentType<{ navData?: any }>;

interface FooterRegistryEntry {
  name: string;
  component: FooterComponent;
  matcher: ShellMatcher;
}

class FooterRegistryClass {
  private registry: Map<string, FooterRegistryEntry> = new Map();

  /**
   * Register a footer.
   * Use a specialized footer for specific routes/contexts.
   */
  register(name: string, component: FooterComponent, matcher: ShellMatcher) {
    if (this.registry.has(name)) {
      this.registry.delete(name);
    }
    this.registry.set(name, { name, component, matcher });
  }

  /**
   * Clear the registry (useful for tests).
   */
  clear() {
    this.registry.clear();
  }

  /**
   * Get a footer component by name directly.
   */
  get(name: string): FooterComponent | undefined {
    return this.registry.get(name)?.component;
  }

  /**
   * Find the best matching footer entry for the current context.
   * Iterates in REVERSE order (LIFO) so latest registrations win.
   */
  findEntry(context: ShellContext): FooterRegistryEntry | undefined {
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
  find(context: ShellContext): FooterComponent | undefined {
    return this.findEntry(context)?.component;
  }

  /**
   * Helper matches function (duplicated from ShellRegistry for now - could be shared util)
   */
  private matches(matcher: ShellMatcher, context: ShellContext): boolean {
    if (typeof matcher === 'function') {
      return matcher(context);
    }

    if (typeof matcher === 'string') {
      if (matcher === '*') return true;
      const path = context.url.pathname;
      if (matcher.endsWith('/*')) {
        const prefix = matcher.slice(0, -2);
        return path.startsWith(prefix);
      }
      if (matcher.startsWith('*')) {
        const suffix = matcher.slice(1);
        return path.endsWith(suffix);
      }
      return path === matcher;
    }

    return false;
  }
}

export const FooterRegistry = new FooterRegistryClass();
