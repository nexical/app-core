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
  /**
   * Optional manual sort order (if applicable).
   */
  order?: number;
}

/**
 * Base Registry implementation ensuring LIFO priority and singleton state.
 * Uses a Map to preserve insertion order.
 */
export class BaseRegistryClass<T, C extends object = PathContext> {
  /**
   * Private storage for registry entries.
   * Map is used specifically to preserve insertion order for LIFO selection.
   */
  private registry: Map<string, RegistryEntry<T, C>> = new Map();

  /**
   * Registers or overrides a component in the registry.
   *
   * WHY: Existing keys are deleted before re-setting to ensure the item
   * moves to the "end" of the Map, giving it the highest priority
   * during reverse (LIFO) iteration.
   */
  public register(entry: RegistryEntry<T, C>): void {
    if (this.registry.has(entry.name)) {
      this.registry.delete(entry.name);
    }
    this.registry.set(entry.name, entry);
  }

  /**
   * Selects an entry based on the provided context.
   *
   * WHY: Selection iterates in REVERSE order (Last-In-First-Out) to allow
   * modules and themes to override core components simply by registering
   * later in the lifecycle.
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
   * Lightweight Manual Glob Matching.
   * Supports '/*', '*', and exact string matches.
   *
   * WHY: Manual implementation minimizes external dependencies and provides
   * high performance for core routing patterns.
   */
  protected matches(matcher: RegistryMatcher<C> | undefined, context: C): boolean {
    if (!matcher) return true;
    if (typeof matcher === 'function') return matcher(context);

    // Ensure context has a URL for string-based path matching
    if (
      !('url' in context) ||
      typeof (context as unknown as PathContext).url?.pathname !== 'string'
    ) {
      return false;
    }

    const path = (context as unknown as PathContext).url.pathname;

    // Glob matching logic (/*, *, exact)
    if (matcher === '*') return true;
    if (matcher.endsWith('/*')) {
      const prefix = matcher.slice(0, -2);
      return path.startsWith(prefix);
    }

    return path === matcher;
  }
}

// Example usage: export const ExampleRegistry = new BaseRegistryClass<MyData, MyContext>();
