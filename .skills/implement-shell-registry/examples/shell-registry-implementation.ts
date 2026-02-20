import type { ShellContext } from '@/lib/ui/nav-context';

/**
 * Example: ShellRegistry Implementation
 * MANDATORY: Singleton Class, LIFO Priority, Polymorphic Matchers.
 */

export type ShellMatcher = string | ((context: ShellContext) => boolean);

export interface ShellRegistryEntry {
  name: string;
  component: React.ComponentType;
  matcher?: ShellMatcher;
}

class ShellRegistryClass {
  // 1. Private Map Storage: Preserves insertion order.
  private registry: Map<string, ShellRegistryEntry> = new Map();

  /**
   * 2. Register with Delete-Set Reordering (LIFO Priority)
   */
  public register(name: string, component: React.ComponentType, matcher?: ShellMatcher): void {
    if (this.registry.has(name)) {
      this.registry.delete(name);
    }
    this.registry.set(name, { name, component, matcher });
  }

  /**
   * 3. Selection with LIFO Logic (Reverse Iteration)
   */
  public select(context: ShellContext): React.ComponentType | undefined {
    // Array conversion for reverse iteration
    const entries = Array.from(this.registry.values());

    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i];
      if (this.matches(entry.matcher, context)) {
        return entry.component;
      }
    }

    return undefined;
  }

  /**
   * 4. Manual Polymorphic Matching (Glob and Predicate)
   */
  private matches(matcher: ShellMatcher | undefined, context: ShellContext): boolean {
    if (!matcher) return true;
    if (typeof matcher === 'function') return matcher(context);

    // Context-specific matching (URL path)
    const path = context.url.pathname;

    // glob matching logic
    if (matcher === '*') return true;
    if (matcher.endsWith('/*')) {
      const prefix = matcher.slice(0, -2);
      return path.startsWith(prefix);
    }

    return path === matcher;
  }
}

// 5. Global Singleton Instance Export
export const ShellRegistry = new ShellRegistryClass();
