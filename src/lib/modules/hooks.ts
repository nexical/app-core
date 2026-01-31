/**
 * Core Hook System (Event Bus) for cross-module communication.
 * Allows modules to publish and subscribe to events without direct coupling.
 */
export class HookSystem {
  private static listeners = new Map<
    string,
    ((data: unknown, context?: unknown) => unknown | Promise<unknown>)[]
  >();

  /**
   * Subscribe to an event or filter.
   * @param event - The event name.
   * @param handler - The function to call. Can return modified data for filters.
   */
  static on<T, C = unknown>(
    event: string,
    handler: (data: T, context?: C) => void | T | Promise<void | T>,
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    // We cast the handler to the generic unknown signature for storage
    this.listeners
      .get(event)
      ?.push(handler as unknown as (data: unknown, context?: unknown) => unknown);
  }

  /**
   * Dispatch an event to all subscribers.
   * @param event - The event name.
   * @param data - The data payload.
   * @param context - Optional context.
   */
  static async dispatch<T, C = unknown>(event: string, data: T, context?: C): Promise<void> {
    const handlers = this.listeners.get(event);
    if (!handlers || handlers.length === 0) return;

    await Promise.allSettled(
      handlers.map((handler) => {
        try {
          return handler(data, context);
        } catch (err) {
          console.error(`[HookSystem] Error in listener for ${event}:`, err);
          return Promise.resolve();
        }
      }),
    );
  }

  /**
   * Pass data through a chain of listeners, allowing each to modify it.
   * @param event - The event name.
   * @param initialData - The initial data.
   * @param context - Optional context to pass to filters.
   * @returns The final modified data.
   */
  static async filter<T, C = unknown>(event: string, initialData: T, context?: C): Promise<T> {
    const handlers = this.listeners.get(event);
    if (!handlers || handlers.length === 0) {
      return initialData;
    }

    let currentData = initialData;
    for (const handler of handlers) {
      try {
        const result = await handler(currentData, context);
        if (result !== undefined) {
          currentData = result as T;
        }
      } catch (err) {
        console.error(`[HookSystem] Error in filter listener for ${event}:`, err);
      }
    }
    return currentData;
  }
}
