/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineApi } from '@/lib/api/api-docs';
import * as GlobHelper from '@/lib/core/glob-helper';
import { createMockAstroContext } from '@tests/unit/helpers';

// Mock GlobHelper entirely
vi.mock('@/lib/core/glob-helper', () => ({
    getApiModules: vi.fn(),
    getCoreInits: vi.fn(),
    getModuleInits: vi.fn(),
    getClientModuleInits: vi.fn(),
}));

describe('api-docs and defineApi', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    describe('defineApi', () => {
        it('should handle unauthorized access for protected routes', async () => {
            const handler = vi.fn();
            const api = defineApi(handler, { protected: true });
            const context = createMockAstroContext({ locals: { actor: undefined } });

            const response = await api(context);
            expect(response.status).toBe(401);
            expect(handler).not.toHaveBeenCalled();
        });

        it('should allow authorized access for protected routes', async () => {
            const actor = { id: 1 };
            const handler = vi.fn().mockResolvedValue({ success: true });
            const api = defineApi(handler, { protected: true });
            const context = createMockAstroContext({ locals: { actor } });

            const response = await api(context);
            expect(response.status).toBe(200);
            expect(handler).toHaveBeenCalledWith(context, actor);
        });

        it('should return raw Response results as-is', async () => {
            const raw = new Response('raw', { status: 201 });
            const api = defineApi(() => raw, { protected: false });
            const response = await api(createMockAstroContext());
            expect(response.status).toBe(201);
            expect(await response.text()).toBe('raw');
        });

        it('should return 204 for null/undefined results', async () => {
            const context = createMockAstroContext();

            expect((await defineApi(() => null, { protected: false })(context)).status).toBe(204);
            expect((await defineApi(() => undefined, { protected: false })(context)).status).toBe(204);
        });

        it('should wrap non-Response results into JSON', async () => {
            const handler = () => ({ foo: 'bar' });
            const api = defineApi(handler, { protected: false });
            const context = createMockAstroContext();

            const response = await api(context);
            expect(response.headers.get('Content-Type')).toBe('application/json');
            const body = await response.json();
            expect(body).toEqual({ foo: 'bar' });
        });

        it('should handle various error types and statuses', async () => {
            const scenarios = [
                { error: new Error('Unauthorized'), expected: 403 },
                { error: new Error('Not found'), expected: 404 },
                { error: { name: 'ZodError', message: 'Invalid' }, expected: 400 },
                { error: new Error('Generic'), expected: 500 }
            ];

            for (const s of scenarios) {
                const handler = () => { throw s.error; };
                const api = defineApi(handler, { protected: false });
                const context = createMockAstroContext();
                const response = await api(context);
                expect(response.status).toBe(s.expected);
            }
        });

        it('should handle Zod errors with issues', async () => {
            const handler = () => {
                const err = new Error('Invalid');
                err.name = 'ZodError';
                (err as any).issues = [{ message: 'too short' }];
                throw err;
            };
            const api = defineApi(handler, { protected: false });
            const response = await api(createMockAstroContext());
            const body = await response.json();
            expect(body.details).toEqual([{ message: 'too short' }]);
        });
    });

    describe('generateDocs', () => {
        it('should generate OpenAPI paths object', async () => {
            const mockModule = {
                GET: defineApi(() => ({}), { summary: 'Get list' })
            };

            vi.mocked(GlobHelper.getApiModules).mockReturnValue({
                '/modules/test-api/src/pages/api/items/index.ts': mockModule
            });

            const { generateDocs: gen } = await import('@/lib/api/api-docs');

            const docs = await gen({ name: 'test-api', path: '' });

            expect(docs['/items']).toBeDefined();
            expect(docs['/items'].get.summary).toBe('Get list');
        });

        it('should handle non-index paths', async () => {
            vi.mocked(GlobHelper.getApiModules).mockReturnValue({
                '/modules/test-api/src/pages/api/direct.ts': { GET: defineApi(() => ({})) }
            });
            const { generateDocs: gen } = await import('@/lib/api/api-docs');
            const docs = await gen({ name: 'test-api', path: '' });
            expect(docs['/direct']).toBeDefined();
        });

        it('should filter visibility based on actor', async () => {
            const mockModule = {
                GET: defineApi(() => ({}), {
                    visibility: (actor) => actor.isAdmin === true
                })
            };

            vi.mocked(GlobHelper.getApiModules).mockReturnValue({
                '/modules/test-api/src/pages/api/secret.ts': mockModule
            });

            const { generateDocs: gen } = await import('@/lib/api/api-docs');

            const adminDocs = await gen({ name: 'test-api', path: '' }, { isAdmin: true });
            expect(adminDocs['/secret']).toBeDefined();

            const userDocs = await gen({ name: 'test-api', path: '' }, { isAdmin: false });
            expect(userDocs['/secret']).toBeUndefined();
        });

        it('should show endpoint if actor is provided but no visibility function defined', async () => {
            const mockModule = {
                GET: defineApi(() => ({}), { summary: 'Publicish' })
            };
            vi.mocked(GlobHelper.getApiModules).mockReturnValue({
                '/modules/test-api/src/pages/api/publicish.ts': mockModule
            });

            const { generateDocs: gen } = await import('@/lib/api/api-docs');
            const docs = await gen({ name: 'test-api', path: '' }, { some: 'actor' });

            expect(docs['/publicish']).toBeDefined();
        });

        it('should show all endpoints if no actor is provided', async () => {
            const mockModule = {
                GET: defineApi(() => ({}), { visibility: () => false })
            };
            vi.mocked(GlobHelper.getApiModules).mockReturnValue({
                '/modules/test-api/src/pages/api/always.ts': mockModule
            });
            const { generateDocs: gen } = await import('@/lib/api/api-docs');

            const docs = await gen({ name: 'test-api', path: '' }, undefined);
            expect(docs['/always']).toBeDefined();
        });
    });
});
