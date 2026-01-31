import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Logger } from '../../../../src/lib/core/logger';
import type { Mock } from 'vitest';

describe('Core Logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  it('should log info messages as JSON', () => {
    Logger.info('test message', { foo: 'bar' });
    expect(console.info).toHaveBeenCalledWith(
      JSON.stringify({ level: 'info', message: 'test message', foo: 'bar' }),
    );
  });

  it('should log error messages with error object as JSON', () => {
    const error = new Error('boom');
    Logger.error('error message', error, { extra: 'data' });
    // eslint-disable-next-line no-console
    console.log('Test output');
    const call = (console.error as Mock).mock.calls[0][0] as string;
    const parsed = JSON.parse(call);

    expect(parsed.level).toBe('error');
    expect(parsed.message).toBe('error message');
    expect(parsed.error.message).toBe('boom');
    expect(parsed.error.stack).toBeDefined();
    expect(parsed.extra).toBe('data');
  });

  it('should log error messages with non-Error as JSON', () => {
    Logger.error('error message', 'string error');
    expect(console.error).toHaveBeenCalledWith(
      JSON.stringify({ level: 'error', message: 'error message', error: 'string error' }),
    );
  });

  it('should log warn messages as JSON', () => {
    Logger.warn('warn message', { type: 'alert' });
    expect(console.warn).toHaveBeenCalledWith(
      JSON.stringify({ level: 'warn', message: 'warn message', type: 'alert' }),
    );
  });

  it('should log debug messages in non-production environment', () => {
    // process.env.NODE_ENV is set to 'test' by Vitest
    Logger.debug('debug message', { context: 'test' });
    // eslint-disable-next-line no-console
    expect(console.debug).toHaveBeenCalledWith(
      JSON.stringify({ level: 'debug', message: 'debug message', context: 'test' }),
    );
  });
});
