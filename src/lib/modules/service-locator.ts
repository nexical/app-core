/**
 * Core Service Locator for dependency injection.
 * Allows modules to provide and consume services in a decoupled way.
 */
import { HookSystem } from './hooks';
import { Logger } from '../core/logger';
export class ServiceLocator {
  private static services = new Map<string, unknown>();

  /**
   * Register a service instance.
   * @param name - The unique name of the service (e.g., 'UserService', 'Search').
   * @param service - The service instance or object.
   */
  static provide<T>(name: string, service: T): void {
    if (this.services.has(name)) {
      Logger.warn(`[ServiceLocator] Service '${name}' is being overwritten.`);
    }
    this.services.set(name, service);
    Logger.info(`[ServiceLocator] Service provided: ${name}`);
    HookSystem.dispatch('core.service.provided', { name });
  }

  /**
   * Retrieve a service instance. Throws if not found.
   * @param name - The name of the service to retrieve.
   */
  static consume<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(
        `[ServiceLocator] Service '${name}' not found. Ensure it is provided before consumption.`,
      );
    }
    return service as T;
  }

  /**
   * safe Retrieve a service instance. Returns undefined if not found.
   * @param name - The name of the service to retrieve.
   */
  static tryConsume<T>(name: string): T | undefined {
    return this.services.get(name) as T | undefined;
  }

  /**
   * Debugging: List all available services.
   */
  static debug(): string[] {
    return Array.from(this.services.keys());
  }
}
