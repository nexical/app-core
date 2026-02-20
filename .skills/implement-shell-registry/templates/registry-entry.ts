/**
 * Interface Template: Registry Entry
 * MANDATORY: Context-bound selection and polymorphic matchers.
 */

/**
 * Registry Selection Context.
 * Defines the environment data required for selection.
 * WHY: Strongly-typed Context interfaces ensure selection logic is predictable
 * and free of the 'any' type.
 */
export interface RegistryContext {
  /**
   * The current URL being processed.
   */
  url: URL;
  /**
   * Dynamic navigation data flags.
   */
  navData: Record<string, unknown>;
  /**
   * Device viewport classification.
   */
  isMobile: boolean;
  /**
   * Optional user identification.
   */
  userId?: string;
}

/**
 * Registry Selection Matcher.
 * WHY: Supports both static string patterns (globs like '/*', '*') and
 * dynamic functional predicates for maximum flexibility.
 */
export type Matcher<C> = string | ((context: C) => boolean);

/**
 * Standard Registry Entry structure.
 *
 * WHY: This interface defines the data (components, metadata) being stored.
 * It ensures consistency across all registry types in the ecosystem.
 */
export interface RegistryEntry<T, C = RegistryContext> {
  /**
   * Unique name of the entry.
   *
   * WHY: LIFO Priority is enforced by re-registering the same name, which
   * deletes the old entry and moves the new one to the "end" of the internal Map.
   */
  name: string;

  /**
   * The component or data being registered.
   */
  component: T;

  /**
   * Matcher (Polymorphic): Predicate function or string pattern (glob).
   */
  matcher?: Matcher<C>;

  /**
   * Metadata (Optional): Order or specific layout hints.
   * Note: Order is often derived from the filename in filesystem registries.
   */
  order?: number;
}
