import { describe, it, expect } from 'vitest';
import { IfStatementPrimitive } from '@nexical/generator/engine/primitives/statements/if';
import { Normalizer } from '@nexical/generator/utils/normalizer';

describe('IfStatementPrimitive', () => {
    it('should generate a simple if block', () => {
        const primitive = new IfStatementPrimitive({
            kind: 'if',
            condition: 'x > 10',
            then: ['console.log("big");']
        });

        const output = primitive.generate();
        expect(Normalizer.normalize(output)).toBe(Normalizer.normalize(`
            if (x > 10) {
                console.log("big");
            }
        `));
    });

    it('should generate if-else block', () => {
        const primitive = new IfStatementPrimitive({
            kind: 'if',
            condition: 'isValid',
            then: ['return true;'],
            else: ['return false;']
        });

        const output = primitive.generate();
        expect(Normalizer.normalize(output)).toBe(Normalizer.normalize(`
            if (isValid) {
                return true;
            } else {
                return false;
            }
        `));
    });

    it('should handle nested statements in blocks', () => {
        const primitive = new IfStatementPrimitive({
            kind: 'if',
            condition: 'check',
            then: [
                { kind: 'return', expression: '1' } // Nested primitive config
            ]
        });

        const output = primitive.generate();
        expect(Normalizer.normalize(output)).toBe(Normalizer.normalize(`
            if (check) {
                return 1;
            }
        `));
    });
});
