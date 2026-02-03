import { describe, it, expect } from 'vitest';
import { init } from '../../src/server-init';

describe('server-init', () => {
  it('should initialize without errors', async () => {
    await init();
    expect(init).toBeDefined();
  });
});
