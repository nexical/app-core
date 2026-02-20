/**
 * Registry Template: Singleton Class
 * MANDATORY: Private Map storage, instance methods, and singleton export.
 */
export type RegistryMatcher<C> = string | ((context: C) => boolean);

export interface RegistryEntry<T, C> {
  name: string;
  data: T;
  matcher?: RegistryMatcher<C>;
  order?: number;
}

export class BaseRegistryClass<T, C = unknown> {
  private registry: Map<string, RegistryEntry<T, C>> = new Map();

  /**
   * Registers or overrides an entry.
   * LIFO Priority: Deletes before setting to ensure the new item is at the "end".
   */
  public register(entry: RegistryEntry<T, C>): void {
    if (this.registry.has(entry.name)) {
      this.registry.delete(entry.name);
    }
    this.registry.set(entry.name, entry);
  }

  /**
   * Selects an entry based on context.
   * LIFO Iteration: Reverse order (last-in-first-out).
   */
  public select(context: C): T | undefined {
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
   * Manual Glob Matching (Polymorphic)
   * Supports '/*', '*', and exact matches.
   */
  protected matches(matcher: RegistryMatcher<C> | undefined, context: C): boolean {
    if (!matcher) return true;
    if (typeof matcher === 'function') return matcher(context);

    // Context-specific matching (e.g., URL path)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const path = (context as any)?.url?.pathname;
    if (!path || typeof matcher !== 'string') return false;

    if (matcher === '*') return true;
    if (matcher.endsWith('/*')) {
      const prefix = matcher.slice(0, -2);
      return path.startsWith(prefix);
    }

    return path === matcher;
  }
}

// Example usage: export const ExampleRegistry = new BaseRegistryClass<MyData, MyContext>();
