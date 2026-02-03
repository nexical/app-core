/* eslint-disable no-console */
import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Log context for correlation ID propagation across async operations.
 * Uses AsyncLocalStorage for automatic context propagation.
 */
export interface LogContext {
  correlationId?: string;
  [key: string]: unknown;
}

const asyncLocalStorage = new AsyncLocalStorage<LogContext>();

/**
 * Run a function within a log context. All Logger calls within this context
 * will automatically include the context metadata.
 */
export function withLogContext<T>(context: LogContext, fn: () => T): T {
  const existing = asyncLocalStorage.getStore() || {};
  return asyncLocalStorage.run({ ...existing, ...context }, fn);
}

/**
 * Get the current log context (if any).
 */
export function getLogContext(): LogContext | undefined {
  return asyncLocalStorage.getStore();
}

/**
 * Set a value in the current context (if one exists).
 */
export function setLogContextValue(key: string, value: unknown): void {
  const store = asyncLocalStorage.getStore();
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
    const context = asyncLocalStorage.getStore() || {};
    const timestamp = new Date().toISOString();
    console.info(JSON.stringify({ timestamp, level: 'info', message, ...context, ...meta }));
  },

  error: (message: string, error?: unknown, meta?: Record<string, unknown>) => {
    const context = asyncLocalStorage.getStore() || {};
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
    const context = asyncLocalStorage.getStore() || {};
    const timestamp = new Date().toISOString();
    console.warn(JSON.stringify({ timestamp, level: 'warn', message, ...context, ...meta }));
  },

  debug: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== 'production') {
      const context = asyncLocalStorage.getStore() || {};
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
