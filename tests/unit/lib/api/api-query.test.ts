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
        it('should handle "ne" operator explicitly', () => {
            const params = new URLSearchParams('age.ne=20');
            const result = parseQuery(params, options);
            expect(result.where.age.not).toBe(20);
        });

        it('should handle dotted keys with missing operators', () => {
            const params = new URLSearchParams('name.contains=Al');
            const result = parseQuery(params, options);
            expect(result.where.name.contains).toBe('Al');
        });

        it('should handle search with mode insensitive', () => {
            const params = new URLSearchParams('search=test');
            const result = parseQuery(params, options);
            expect(result.where.OR[0].name.mode).toBe('insensitive');
        });

        it('should handle order by with direction', () => {
            const params = new URLSearchParams('orderBy=age:desc');
            const result = parseQuery(params, options);
            expect(result.orderBy.age).toBe('desc');
        });
    });
});
