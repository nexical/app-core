/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineApi } from '@/lib/api/api-docs';
import * as GlobHelper from '@/lib/core/glob-helper';
import { createMockAstroContext } from '@tests/unit/helpers';

// Mock GlobHelper entirely
vi.mock('@/lib/core/glob-helper', () => ({
    getApiModules: vi.fn(),
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
                { error: new Error('Forbidden access'), expected: 403 },
                { error: new Error('Access denied'), expected: 403 },
                { error: new Error('Not a member'), expected: 403 },
                { error: new Error('Not found items'), expected: 404 },
                { error: { name: 'ZodError', message: 'Invalid' }, expected: 400 },
                { error: new Error('already exists'), expected: 400 },
                { error: new Error('mismatch detected'), expected: 400 },
                { error: new Error('Generic'), expected: 500 },
                { error: null, expected: 500 },
                { error: 'String error', expected: 500 }
            ];

            for (const s of scenarios) {
                const handler = () => {
                    if (s.error === null) throw undefined;
                    if (typeof s.error === 'string') throw s.error;
                    throw s.error;
                };
                const api = defineApi(handler, { protected: false });
                const context = createMockAstroContext();
                const response = await api(context);
                expect(response.status).toBe(s.expected);
            }
        });

        it('should handle non-string error messages in branch 82', async () => {
            const api = defineApi(() => { throw { message: 123 }; }, { protected: false });
            const response = await api(createMockAstroContext());
            expect(response.status).toBe(500);
        });
    });

    describe('generateDocs', () => {
        it('should generate OpenAPI paths object and handle all branches', async () => {
            vi.mocked(GlobHelper.getApiModules).mockReturnValue({
                '/modules/test-api/src/pages/api/items/index.ts': {
                    GET: Object.assign(vi.fn(), { schema: { summary: 'Get list', tags: ['items'] } }),
                    POST: Object.assign(vi.fn(), {}) // Default branch
                },
                '/modules/test-api/src/pages/api/users/[id]/profile.ts': {
                    GET: Object.assign(vi.fn(), {})
                }
            });

            const { generateDocs: gen } = await import('@/lib/api/api-docs');
            const docs = await gen({ name: 'test-api', path: '' });

            expect(docs['/items']).toBeDefined();
            expect(docs['/items'].get.summary).toBe('Get list');
            expect(docs['/items'].post).toBeDefined();
            expect(docs['/users/{id}/profile']).toBeDefined();
        });

        it('should handle root path, non-matching files and empty pathItem', async () => {
            vi.mocked(GlobHelper.getApiModules).mockReturnValue({
                '/modules/test-api/src/pages/api/index.ts': {
                    GET: Object.assign(vi.fn(), {})
                },
                '/modules/other-api/src/pages/api/something.ts': { // Line 118: should be skipped
                    GET: Object.assign(vi.fn(), {})
                },
                '/modules/test-api/src/pages/api/empty.ts': { // Line 167: should be skipped from paths
                    OTHER: vi.fn()
                }
            });

            const { generateDocs: gen } = await import('@/lib/api/api-docs');
            const docs = await gen({ name: 'test-api', path: '' });

            expect(docs['/']).toBeDefined(); // Line 128
            expect(Object.keys(docs)).toHaveLength(1); // root only
        });

        it('should handle visibility branches', async () => {
            const mockModule = {
                GET: Object.assign(vi.fn(), {
                    schema: { visibility: (actor: any) => actor.isAdmin }
                }),
                POST: Object.assign(vi.fn(), { schema: { summary: 'No visibility' } })
            };

            vi.mocked(GlobHelper.getApiModules).mockReturnValue({
                '/modules/test-api/src/pages/api/admin.ts': mockModule
            });

            const { generateDocs: gen } = await import('@/lib/api/api-docs');

            // 1. No actor -> show all
            const publicDocs = await gen({ name: 'test-api', path: '' });
            expect(publicDocs['/admin'].get).toBeDefined();
            expect(publicDocs['/admin'].post).toBeDefined();

            // 2. Actor with visibility function
            const adminDocs = await gen({ name: 'test-api', path: '' }, { isAdmin: true });
            expect(adminDocs['/admin'].get).toBeDefined();

            const userDocs = await gen({ name: 'test-api', path: '' }, { isAdmin: false });
            expect(userDocs['/admin'].get).toBeUndefined();
            expect(userDocs['/admin'].post).toBeDefined(); // visibility is undefined -> true
        });
    });
});
