import { describe, it, expect } from 'vitest';
import { parseQuery, generateFilterDocs, getAllowedOperators, InvalidFilterError } from '@/lib/api/api-query';

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
    });

    describe('helper functions', () => {
        it('should return allowed operators by type', () => {
            expect(getAllowedOperators('boolean')).toEqual(['eq', 'ne']);
            expect(getAllowedOperators('number')).toContain('gt');
        });

        it('should generate filter docs for OpenAPI', () => {
            const docs = generateFilterDocs({ fields: { name: 'string' } });
            expect(docs).toContainEqual(expect.objectContaining({ name: 'name.eq' }));
            expect(docs).toContainEqual(expect.objectContaining({ name: 'name.contains' }));
        });
    });
});
