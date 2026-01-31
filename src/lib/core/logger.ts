/* eslint-disable no-console */
/**
 * Simple structured logger for standardizing application logging.
 * Replaces direct console usage to ensure consistent formatting.
 */
export const Logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    console.info(JSON.stringify({ level: 'info', message, ...meta }));
  },
  error: (message: string, error?: unknown, meta?: Record<string, unknown>) => {
    console.error(
      JSON.stringify({
        level: 'error',
        message,
        error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
        ...meta,
      }),
    );
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(JSON.stringify({ level: 'warn', message, ...meta }));
  },
  debug: (message: string, meta?: Record<string, unknown>) => {
    // Only log debug in development if needed, or use a flag
    if (process.env.NODE_ENV !== 'production') {
      console.debug(JSON.stringify({ level: 'debug', message, ...meta }));
    }
  },
};
