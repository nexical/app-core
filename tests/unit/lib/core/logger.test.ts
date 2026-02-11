import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  Logger,
  withLogContext,
  getLogContext,
  setLogContextValue,
  generateCorrelationId,
} from '../../../../src/lib/core/logger';
import type { Mock } from 'vitest';

describe('Core Logger', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  it('should log info messages as JSON', () => {
    Logger.info('test message', { foo: 'bar' });
    expect(console.info).toHaveBeenCalledWith(
      expect.stringMatching(/"level":"info","message":"test message","foo":"bar"/),
    );
    expect(JSON.parse((console.info as Mock).mock.calls[0][0])).toHaveProperty('timestamp');
  });

  it('should log error messages with error object as JSON', () => {
    const error = new Error('boom');
    Logger.error('error message', error, { extra: 'data' });
    Logger.info('Test output');
    const call = (console.error as Mock).mock.calls[0][0] as string;
    const parsed = JSON.parse(call);

    expect(parsed.timestamp).toBeDefined();
    expect(parsed.level).toBe('error');
    expect(parsed.message).toBe('error message');
    expect(parsed.error.message).toBe('boom');
    expect(parsed.error.stack).toBeDefined();
    expect(parsed.extra).toBe('data');
  });

  it('should log error messages with non-Error as JSON', () => {
    Logger.error('error message', 'string error');
    expect(console.error).toHaveBeenCalledWith(
      expect.stringMatching(/"level":"error","message":"error message","error":"string error"/),
    );
    expect(JSON.parse((console.error as Mock).mock.calls[0][0])).toHaveProperty('timestamp');
  });

  it('should log warn messages as JSON', () => {
    Logger.warn('warn message', { type: 'alert' });
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringMatching(/"level":"warn","message":"warn message","type":"alert"/),
    );
    expect(JSON.parse((console.warn as Mock).mock.calls[0][0])).toHaveProperty('timestamp');
  });

  it('should log debug messages in non-production environment', () => {
    // process.env.NODE_ENV is set to 'test' by Vitest
    Logger.debug('debug message', { context: 'test' });
    // eslint-disable-next-line no-console
    expect(console.debug).toHaveBeenCalledWith(
      expect.stringMatching(/"level":"debug","message":"debug message","context":"test"/),
    );
    // eslint-disable-next-line no-console
    expect(JSON.parse((console.debug as Mock).mock.calls[0][0])).toHaveProperty('timestamp');
  });

  it('should NOT log debug messages in production environment', () => {
    vi.stubEnv('NODE_ENV', 'production');
    // eslint-disable-next-line no-console
    expect(console.debug).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });

  describe('Log Context', () => {
    it('should run with context', () => {
      const context = { correlationId: 'test-cor' };
      withLogContext(context, () => {
        const store = getLogContext();
        expect(store).toEqual(context);

        Logger.info('message with context');
        const call = (console.info as Mock).mock.calls[
          (console.info as Mock).mock.calls.length - 1
        ][0];
        expect(JSON.parse(call)).toMatchObject(context);
      });
    });

    it('should set context value', () => {
      withLogContext({}, () => {
        setLogContextValue('foo', 'bar');
        expect(getLogContext()).toEqual({ foo: 'bar' });
      });
    });

    it('should do nothing when setting context value outside of context', () => {
      // Should not throw
      setLogContextValue('outside', 'value');
      expect(getLogContext()).toBeUndefined();
    });

    it('should nesting context', () => {
      withLogContext({ a: 1 }, () => {
        withLogContext({ b: 2 }, () => {
          expect(getLogContext()).toEqual({ a: 1, b: 2 });
        });
      });
    });
  });

  describe('Correlation ID', () => {
    it('should generate a correlation ID', () => {
      const id = generateCorrelationId();
      expect(id).toMatch(/^cor_[a-z0-9]+_[a-z0-9]+$/);
    });
  });

  describe('Child Logger', () => {
    it('should log with child metadata', () => {
      const child = Logger.child({ component: 'test' });

      child.info('info');
      expect(console.info).toHaveBeenCalledWith(expect.stringContaining('"component":"test"'));

      child.error('error', new Error('fail'));
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('"component":"test"'));

      child.warn('warn');
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('"component":"test"'));

      child.debug('debug');
      // eslint-disable-next-line no-console
      expect(console.debug).toHaveBeenCalledWith(expect.stringContaining('"component":"test"'));
    });
  });
});
