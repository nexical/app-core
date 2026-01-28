import { describe, it, expect } from 'vitest';
import { parseQuery, generateFilterDocs, getAllowedOperators, InvalidFilterError, type FilterFieldType } from '@/lib/api/api-query';

describe('api-query', () => {
    const options = {
        fields: {
            name: 'string' as const,
            age: 'number' as const,
            active: 'boolean' as const,
            role: 'enum' as const,
            createdAt: 'date' as const
        },
        searchFields: ['name'],
        defaults: { take: 10 }
    };

    describe('parseQuery', () => {
        it('should parse basic equality and range filters', () => {
            const params = new URLSearchParams('name=Alice&age.gt=20&active=true');
            const result = parseQuery(params, options);

            expect(result.where).toEqual({
                name: 'Alice',
                age: { gt: 20 },
                active: true
            });
            expect(result.take).toBe(10);
        });

        it('should handle pagination and ordering', () => {
            const params = new URLSearchParams('take=20&skip=5&orderBy=age:desc');
            const result = parseQuery(params, options);

            expect(result.take).toBe(20);
            expect(result.skip).toBe(5);
            expect(result.orderBy).toEqual({ age: 'desc' });
        });

        it('should handle search queries', () => {
            const params = new URLSearchParams('search=bob');
            const result = parseQuery(params, options);

            expect(result.where.OR).toEqual([
                { name: { contains: 'bob', mode: 'insensitive' } }
            ]);
        });

        it('should handle "in" operator for different types', () => {
            const params = new URLSearchParams('role.in=ADMIN,USER&age.in=20,30');
            const result = parseQuery(params, options);

            expect(result.where.role.in).toEqual(['ADMIN', 'USER']);
            expect(result.where.age.in).toEqual([20, 30]);
        });

        it('should handle all operators with appropriate types', () => {
            // String operators
            const stringOps = ['contains', 'startsWith', 'endsWith'];
            for (const op of stringOps) {
                const params = new URLSearchParams(`name.${op}=val`);
                const result = parseQuery(params, { fields: { name: 'string' } });
                expect(result.where.name[op]).toBe('val');
            }

            // Number/Range operators
            const rangeOps = ['lt', 'lte', 'gt', 'gte'];
            for (const op of rangeOps) {
                const params = new URLSearchParams(`age.${op}=25`);
                const result = parseQuery(params, { fields: { age: 'number' } });
                expect(result.where.age[op]).toBe(25);
            }

            // Not equal
            const paramsNe = new URLSearchParams('name.ne=val');
            const resultNe = parseQuery(paramsNe, { fields: { name: 'string' } });
            expect(resultNe.where.name.not).toBe('val');
        });

        it('should handle all operator types (gt, gte, lt, lte, in, eq, ne, startsWith, endsWith, contains)', () => {
            const types: FilterFieldType[] = ['string', 'number', 'boolean', 'date', 'enum'];

            for (const type of types) {
                const allowed = getAllowedOperators(type);
                for (const op of allowed) {
                    const value = type === 'number' ? '123' : type === 'boolean' ? 'true' : 'test';
                    const params = new URLSearchParams(`field.${op}=${value}`);
                    const result = parseQuery(params, { fields: { field: type } });
                    expect(result.where.field).toBeDefined();
                }
            }
        });

        it('should throw InvalidFilterError for invalid fields with suggestions', () => {
            const params = new URLSearchParams('nam.eq=test');
            expect(() => parseQuery(params, options)).toThrow(InvalidFilterError);

            try {
                parseQuery(params, options);
            } catch (e: any) {
                expect(e.details[0].type).toBe('INVALID_FIELD');
                expect(e.details[0].suggestions).toContain('name');
            }
        });

        it('should throw InvalidFilterError for invalid operators', () => {
            const params = new URLSearchParams('active.gt=true'); // gt not allowed for boolean
            expect(() => parseQuery(params, options)).toThrow(InvalidFilterError);
        });

        it('should handle orderBy without explicit direction (defaults to asc)', () => {
            const params = new URLSearchParams('orderBy=name');
            const result = parseQuery(params, options);
            expect(result.orderBy).toEqual({ name: 'asc' });
        });

        it('should merge extra defaults into where clause if not provided in query', () => {
            const optionsWithDefaults = {
                ...options,
                defaults: {
                    ...options.defaults,
                    tenantId: '123'
                }
            };
            const params = new URLSearchParams('name=Alice');
            const result = parseQuery(params, optionsWithDefaults);
            expect(result.where.name).toBe('Alice');
            expect(result.where.tenantId).toBe('123');
        });

        it('should handle boolean true in parseValue', () => {
            // parseValue is internal but called via gt/gte/lt/lte/in
            // Let's use 'in' operator to trigger it for boolean (though 'in' for boolean is rare)
            const params = new URLSearchParams('active.in=true,false');
            const result = parseQuery(params, { fields: { active: 'boolean' } });
            expect(result.where.active.in).toEqual([true, false]);
        });

        it('should skip search if searchFields is empty or undefined', () => {
            const params = new URLSearchParams('search=test');
            const result = parseQuery(params, { fields: { name: 'string' }, searchFields: [] });
            expect(result.where.OR).toBeUndefined();

            const resultNoFields = parseQuery(params, { fields: { name: 'string' } });
            expect(resultNoFields.where.OR).toBeUndefined();
        });

        it('should handle multiple filters on the same field', () => {
            const params = new URLSearchParams('age.gt=18&age.lt=65');
            const result = parseQuery(params, options);
            expect(result.where.age).toEqual({ gt: 18, lt: 65 });
        });

        it('should handle date types in parseValue', () => {
            const params = new URLSearchParams('createdAt.gt=2024-01-01');
            const result = parseQuery(params, options);
            expect(result.where.createdAt.gt).toBe('2024-01-01');
        });

        it('should handle invalid number in parseValue', () => {
            const params = new URLSearchParams('age.gt=not-a-number');
            const result = parseQuery(params, options);
            expect(result.where.age.gt).toBeUndefined();
        });

        it('should provide suggestions for dotted field typos', () => {
            try {
                parseQuery(new URLSearchParams('profile.name.eq=test'), options);
            } catch (e: any) {
                expect(e.details[0].message).toContain('is not allowed');
            }
        });
    });

    describe('helper functions', () => {
        it('should return allowed operators by type', () => {
            expect(getAllowedOperators('boolean')).toEqual(['eq', 'ne', 'in']);
            expect(getAllowedOperators('number')).toContain('gt');
        });

        it('should generate filter docs for OpenAPI', () => {
            const docs = generateFilterDocs({ fields: { name: 'string' } });
            expect(docs).toContainEqual(expect.objectContaining({ name: 'name.eq' }));
            expect(docs).toContainEqual(expect.objectContaining({ name: 'name.contains' }));
        });
    });
});
