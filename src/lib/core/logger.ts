/* eslint-disable no-console */
import type { AsyncLocalStorage } from 'node:async_hooks';

export interface LogContext {
  correlationId?: string;
  [key: string]: unknown;
}

/**
 * Internal storage for log context.
 * On the server, this uses AsyncLocalStorage.
 * In the browser, this uses a simple variable (since there is no concurrency).
 */
class LogStorage {
  private static instance: AsyncLocalStorage<LogContext> | null = null;
  private static browserStore: LogContext | undefined = undefined;

  static async init() {
    if (typeof window === 'undefined' && !this.instance) {
      try {
        const { AsyncLocalStorage } = await import('node:async_hooks');
        this.instance = new AsyncLocalStorage<LogContext>();
      } catch {
        // Ignore or fallback
      }
    }
  }

  static getStore(): LogContext | undefined {
    if (typeof window !== 'undefined') {
      return this.browserStore;
    }
    return this.instance?.getStore();
  }

  static run<T>(context: LogContext, fn: () => T): T {
    if (typeof window !== 'undefined') {
      const prev = this.browserStore;
      this.browserStore = { ...prev, ...context };
      try {
        return fn();
      } finally {
        this.browserStore = prev;
      }
    }

    if (this.instance) {
      const existing = this.instance.getStore() || {};
      return this.instance.run({ ...existing, ...context }, fn);
    }
    return fn();
  }
}

// Initialize immediately (non-blocking)
if (typeof window === 'undefined') {
  LogStorage.init();
}

/**
 * Run a function within a log context. All Logger calls within this context
 * will automatically include the context metadata.
 */
export function withLogContext<T>(context: LogContext, fn: () => T): T {
  return LogStorage.run(context, fn);
}

/**
 * Get the current log context (if any).
 */
export function getLogContext(): LogContext | undefined {
  return LogStorage.getStore();
}

/**
 * Set a value in the current context (if one exists).
 */
export function setLogContextValue(key: string, value: unknown): void {
  const store = LogStorage.getStore();
  if (store) {
    store[key] = value;
  }
}

/**
 * Generate a unique correlation ID.
 */
export function generateCorrelationId(): string {
  return `cor_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Structured logger with automatic context propagation.
 * Outputs JSON with correlation IDs for distributed tracing.
 */
export const Logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    const context = LogStorage.getStore() || {};
    const timestamp = new Date().toISOString();
    console.info(JSON.stringify({ timestamp, level: 'info', message, ...context, ...meta }));
  },

  error: (message: string, error?: unknown, meta?: Record<string, unknown>) => {
    const context = LogStorage.getStore() || {};
    const timestamp = new Date().toISOString();
    console.error(
      JSON.stringify({
        timestamp,
        level: 'error',
        message,
        error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
        ...context,
        ...meta,
      }),
    );
  },

  warn: (message: string, meta?: Record<string, unknown>) => {
    const context = LogStorage.getStore() || {};
    const timestamp = new Date().toISOString();
    console.warn(JSON.stringify({ timestamp, level: 'warn', message, ...context, ...meta }));
  },

  debug: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== 'production') {
      const context = LogStorage.getStore() || {};
      const timestamp = new Date().toISOString();
      console.debug(JSON.stringify({ timestamp, level: 'debug', message, ...context, ...meta }));
    }
  },

  /**
   * Create a child logger with additional default context.
   */
  child: (defaultMeta: Record<string, unknown>) => ({
    info: (message: string, meta?: Record<string, unknown>) =>
      Logger.info(message, { ...defaultMeta, ...meta }),
    error: (message: string, error?: unknown, meta?: Record<string, unknown>) =>
      Logger.error(message, error, { ...defaultMeta, ...meta }),
    warn: (message: string, meta?: Record<string, unknown>) =>
      Logger.warn(message, { ...defaultMeta, ...meta }),
    debug: (message: string, meta?: Record<string, unknown>) =>
      Logger.debug(message, { ...defaultMeta, ...meta }),
  }),
};
