import { describe, it, expect } from 'vitest';
import { onRequest } from '../../src/middleware';
import { createMockAstroContext, createMockNext } from '@tests/unit/helpers';

describe('orchestrator-api middleware', () => {
  it('should call next()', async () => {
    const context = createMockAstroContext();
    const next = createMockNext();
    await onRequest(context, next);
    expect(next).toHaveBeenCalled();
  });

  it('should call next() if actor is present', async () => {
    const context = createMockAstroContext({ locals: { actor: { id: '1' } } });
    const next = createMockNext();
    await onRequest(context, next);
    expect(next).toHaveBeenCalled();
  });

  it("should call next() even for public routes (current implementation doesn't block)", async () => {
    const context = createMockAstroContext({ url: 'http://localhost/public' });
    const next = createMockNext();
    await onRequest(context, next);
    expect(next).toHaveBeenCalled();
  });
});
