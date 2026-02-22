/**
 * Registry Template: Singleton Class
 * MANDATORY: Private Map storage, instance methods, and singleton export.
 */

/**
 * Registry Selection Matcher.
 * Supports static string patterns (globs) or dynamic functional predicates.
 */
export type RegistryMatcher<C> = string | ((context: C) => boolean);

/**
 * Common context interface for registries using path matching.
 */
export interface PathContext {
  url: { pathname: string };
}

/**
 * Standard Registry Entry structure.
 */
export interface RegistryEntry<T, C> {
  /**
   * Unique name of the entry.
   * Used for LIFO reordering during registration.
   */
  name: string;
  /**
   * The data or component being registered.
   */
  data: T;
  /**
   * Optional matcher for context-aware selection.
   */
  matcher?: RegistryMatcher<C>;
}

/**
 * Registry Class providing global state management.
 *
 * WHY: This class handles the viewport and zone slots as the "Immutable Kernel."
 * It utilizes a private Map storage to preserve insertion order, which is
 * critical for context-aware selection.
 */
class FeatureRegistryClass<T, C extends object = PathContext> {
  /**
   * Private Map Storage: Preserves insertion order.
   * WHY: Map ensures that registration sequence is maintained, allowing
   * the select() method to correctly prioritize later registrations (LIFO).
   */
  private registry: Map<string, RegistryEntry<T, C>> = new Map();

  /**
   * Register with Delete-Set Reordering (LIFO Priority).
   *
   * WHY: Deleting existing keys before re-setting ensures that the most
   * recently registered component for a given name takes precedence by
   * moving it to the end of the Map.
   */
  public register(name: string, data: T, matcher?: RegistryMatcher<C>): void {
    if (this.registry.has(name)) {
      this.registry.delete(name);
    }
    this.registry.set(name, { name, data, matcher });
  }

  /**
   * Selection with LIFO Logic (Reverse Iteration).
   *
   * WHY: Iterating through registry entries in reverse order (last to first)
   * ensures that the latest module or theme to register a component for
   * a specific condition wins.
   */
  public select(context: C): T | undefined {
    // Array conversion for reverse iteration while preserving Map order
    const entries = Array.from(this.registry.values());

    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i];
      if (this.matches(entry.matcher, context)) {
        return entry.data;
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
  private matches(matcher: RegistryMatcher<C> | undefined, context: C): boolean {
    if (!matcher) return true;
    if (typeof matcher === 'function') return matcher(context);

    // Ensure context has a URL for string-based path matching
    // Note: Cast to PathContext is safe here because we check for 'url' existence
    const ctx = context as unknown as PathContext;
    if (!ctx.url || typeof ctx.url.pathname !== 'string') {
      return false;
    }

    const path = ctx.url.pathname;

    // Glob matching logic (/*, *, exact)
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
export const FeatureRegistry = new FeatureRegistryClass<unknown, PathContext>();
