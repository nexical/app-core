import { describe, it, expect } from 'vitest';
import { APP_VERSION } from '../../../../src/lib/core/version';

describe('Version', () => {
  it('should have a version', () => {
    expect(APP_VERSION).toBeDefined();
    expect(typeof APP_VERSION).toBe('string');
  });
});
