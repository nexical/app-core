import type { ShellContext } from '@/lib/ui/nav-context';

/**
 * Example: ShellRegistry Implementation
 * MANDATORY: Singleton Class, LIFO Priority, Polymorphic Matchers.
 */

/**
 * Shell Registry Matcher.
 * Supports static string patterns (globs like '/*', '*') or dynamic functional predicates.
 */
export type ShellMatcher = string | ((context: ShellContext) => boolean);

/**
 * Standard interface for Shell Registry entries.
 */
export interface ShellRegistryEntry {
  /**
   * Unique name of the entry.
   * Re-registration of the same name triggers LIFO reordering.
   */
  name: string;
  /**
   * The React component being registered.
   */
  component: React.ComponentType;
  /**
   * Matcher (Polymorphic): Predicate function or string pattern (glob).
   */
  matcher?: ShellMatcher;
}

/**
 * ShellRegistryClass provides global state management for application layouts.
 *
 * WHY: This class handles the viewport and zone slots as the "Immutable Kernel."
 * It utilizes a private Map storage to preserve insertion order, which is
 * critical for context-aware selection.
 */
class ShellRegistryClass {
  /**
   * Private Map Storage: Preserves insertion order.
   * WHY: Map ensures that registration sequence is maintained, allowing
   * the select() method to correctly prioritize later registrations (LIFO).
   */
  private registry: Map<string, ShellRegistryEntry> = new Map();

  /**
   * Register with Delete-Set Reordering (LIFO Priority).
   *
   * WHY: Deleting existing keys before re-setting ensures that the most
   * recently registered component for a given name takes precedence by
   * moving it to the end of the Map.
   */
  public register(name: string, component: React.ComponentType, matcher?: ShellMatcher): void {
    if (this.registry.has(name)) {
      this.registry.delete(name);
    }
    this.registry.set(name, { name, component, matcher });
  }

  /**
   * Selection with LIFO Logic (Reverse Iteration).
   *
   * WHY: Iterating through registry entries in reverse order (last to first)
   * ensures that the latest module or theme to register a component for
   * a specific condition wins.
   */
  public select(context: ShellContext): React.ComponentType | undefined {
    // Array conversion for reverse iteration while preserving Map order
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
   * Lightweight Manual Polymorphic Matching (Glob and Predicate).
   * Supports '/*', '*', and exact string matches.
   *
   * WHY: Implementing manual path matching minimizes core dependencies and
   * provides high-performance routing for the shell.
   */
  private matches(matcher: ShellMatcher | undefined, context: ShellContext): boolean {
    if (!matcher) return true;
    if (typeof matcher === 'function') return matcher(context);

    // Extract path from strongly-typed ShellContext
    const path = context.url.pathname;

    // Glob matching logic: Exact, '/*', '*'
    if (matcher === '*') return true;
    if (matcher.endsWith('/*')) {
      const prefix = matcher.slice(0, -2);
      return path.startsWith(prefix);
    }

    return path === matcher;
  }
}

/**
 * Singleton Registry Instance.
 * MANDATORY: Export a single named constant instance to ensure a global
 * singleton state. Direct instantiation outside of this file is discouraged.
 */
export const ShellRegistry = new ShellRegistryClass();
