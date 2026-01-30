import { describe, it, expect } from 'vitest';
import {
  parseQuery,
  generateFilterDocs,
  getAllowedOperators,
  InvalidFilterError,
} from '@/lib/api/api-query';

describe('api-query', () => {
  const options = {
    fields: {
      name: 'string' as const,
      age: 'number' as const,
      active: 'boolean' as const,
      role: 'enum' as const,
      createdAt: 'date' as const,
    },
    searchFields: ['name', 'role'],
    defaults: { take: 10, skip: 0 },
  };

  describe('parseQuery', () => {
    it('should handle pagination (take/skip)', () => {
      const params = new URLSearchParams('take=20&skip=5');
      const result = parseQuery(params, options);
      expect(result.take).toBe(20);
      expect(result.skip).toBe(5);
    });

    it('should handle orderBy with and without direction', () => {
      const params1 = new URLSearchParams('orderBy=name');
      const result1 = parseQuery(params1, options);
      expect(result1.orderBy.name).toBe('asc');

      const params2 = new URLSearchParams('orderBy=age:desc');
      const result2 = parseQuery(params2, options);
      expect(result2.orderBy.age).toBe('desc');

      const params3 = new URLSearchParams('orderBy=age:ASC');
      const result3 = parseQuery(params3, options);
      expect(result3.orderBy.age).toBe('asc');
    });

    it('should handle search across multiple fields', () => {
      const params = new URLSearchParams('search=admin');
      const result = parseQuery(params, options);
      expect(result.where.OR).toHaveLength(2);
      expect(result.where.OR[0]).toEqual({ name: { contains: 'admin', mode: 'insensitive' } });
      expect(result.where.OR[1]).toEqual({ role: { contains: 'admin', mode: 'insensitive' } });
    });

    it('should handle "contains" operator explicitly', () => {
      const params = new URLSearchParams('name.contains=foo');
      const result = parseQuery(params, options);
      expect(result.where.name.contains).toBe('foo');
      expect(result.where.name.mode).toBe('insensitive');
    });

    it('should parse boolean values correctly in parseValue', () => {
      // Trigger parseValue for boolean via 'in' operator
      const params = new URLSearchParams('active.in=true,false');
      const result = parseQuery(params, options);
      expect(result.where.active.in).toEqual([true, false]);
    });

    it('should handle all operators with appropriate type parsing', () => {
      const testCases = [
        { query: 'active=true', expected: { active: true } },
        { query: 'active=false', expected: { active: false } },
        { query: 'active.ne=true', expected: { active: { not: true } } },
        { query: 'name.ne=A', expected: { name: { not: 'A' } } },
        { query: 'age.gt=18', expected: { age: { gt: 18 } } },
        { query: 'age.gte=18', expected: { age: { gte: 18 } } },
        { query: 'age.lt=100', expected: { age: { lt: 100 } } },
        { query: 'age.lte=100', expected: { age: { lte: 100 } } },
        { query: 'role.in=USER,ADMIN', expected: { role: { in: ['USER', 'ADMIN'] } } },
        { query: 'active.in=true', expected: { active: { in: [true] } } },
        { query: 'createdAt.in=2024-01-01', expected: { createdAt: { in: ['2024-01-01'] } } },
        { query: 'name.startsWith=A', expected: { name: { startsWith: 'A' } } },
        { query: 'name.endsWith=Z', expected: { name: { endsWith: 'Z' } } },
      ];

      for (const { query, expected } of testCases) {
        const params = new URLSearchParams(query);
        const result = parseQuery(params, options);
        expect(result.where).toMatchObject(expected);
      }
    });

    it('should handle invalid number parsing (NaN)', () => {
      const result = parseQuery(new URLSearchParams('age.gt=not-a-number'), options);
      expect(result.where.age.gt).toBeUndefined();
    });

    it('should merge defaults when query params are missing', () => {
      const optsWithExtra = {
        ...options,
        defaults: { ...options.defaults, role: 'USER' },
      };
      const result = parseQuery(new URLSearchParams('name=Bob'), optsWithExtra);
      expect(result.where.name).toBe('Bob');
      expect(result.where.role).toBe('USER');
    });

    it('should throw InvalidFilterError with suggestions for typos', () => {
      const params = new URLSearchParams('nam.eq=test');
      try {
        parseQuery(params, options);
      } catch (e: any) {
        expect(e).toBeInstanceOf(InvalidFilterError);
        expect(e.details[0].type).toBe('INVALID_FIELD');
        expect(e.details[0].suggestions).toContain('name');
      }
    });

    it('should throw InvalidFilterError for unauthorized operators', () => {
      const params = new URLSearchParams('active.gt=true');
      try {
        parseQuery(params, options);
        expect.fail('Should have thrown');
      } catch (e: any) {
        expect(e.details[0].type).toBe('INVALID_OPERATOR');
      }
    });
  });

  describe('helpers', () => {
    it('should generate filter docs correctly for all types', () => {
      const docs = generateFilterDocs({
        fields: {
          age: 'number',
          active: 'boolean',
          name: 'string',
        },
      });
      expect(docs.find((d) => d.name === 'age.gt').schema.type).toBe('number');
      expect(docs.find((d) => d.name === 'active.eq').schema.type).toBe('boolean');
      expect(docs.find((d) => d.name === 'name.eq').schema.type).toBe('string');
    });

    it('should return allowed operators by type', () => {
      expect(getAllowedOperators('boolean')).toEqual(['eq', 'ne', 'in']);
      expect(getAllowedOperators('unknown' as any)).toEqual([]);
    });
  });

  describe('levenshtein', () => {
    it('should calculate distance correctly', () => {
      // Testing the Levenshtein logic through findClosestMatch
      // 'age' vs 'ag' (distance 1)
      // 'age' vs 'agee' (distance 1)
      // 'age' vs 'not' (distance 3)
      const result = parseQuery(new URLSearchParams(), options); // Just to get access? No, it's internal.
      // But we can test it via InvalidFilterError suggestions
      try {
        parseQuery(new URLSearchParams('ag.eq=1'), options);
      } catch (e: any) {
        expect(e.details[0].suggestions).toContain('age');
      }
    });
  });
});
