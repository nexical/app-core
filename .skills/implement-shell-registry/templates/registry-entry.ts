/**
 * Interface Template: Registry Entry
 * MANDATORY: Context-bound selection and polymorphic matchers.
 */

export interface RegistryContext {
  url: URL;
  navData: Record<string, unknown>;
  isMobile: boolean;
  userAgent?: string;
  theme?: string;
}

export type Matcher<C> = string | ((context: C) => boolean);

export interface RegistryEntry<T, C = RegistryContext> {
  /**
   * Unique name of the entry.
   * LIFO Priority: Re-registering the same name moves it to the "end".
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
   */
  order?: number;
}
