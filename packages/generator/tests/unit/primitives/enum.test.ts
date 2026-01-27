import { describe, it, expect } from 'vitest';
import { createTestProject } from '../../helpers/test-project';
import { EnumPrimitive } from '../../../src/engine/primitives/nodes/enum';

describe('EnumPrimitive', () => {
    it('should create a new enum', () => {
        const testProject = createTestProject();
        const sourceFile = testProject.createSourceFile('test.ts', '');

        const primitive = new EnumPrimitive({
            name: 'TestEnum',
            isExported: true,
            members: [
                { name: 'A', value: 'a' },
                { name: 'B', value: 'b' }
            ]
        });

        primitive.ensure(sourceFile);

        const enumDecl = sourceFile.getEnum('TestEnum');
        expect(enumDecl).toBeDefined();
        expect(enumDecl?.isExported()).toBe(true);
        expect(enumDecl?.getMember('A')?.getValue()).toBe('a');
        expect(enumDecl?.getMember('B')?.getValue()).toBe('b');
    });

    it('should update an existing enum', () => {
        const testProject = createTestProject();
        const sourceFile = testProject.createSourceFile('test.ts', 'enum TestEnum { A = "a" }');

        const primitive = new EnumPrimitive({
            name: 'TestEnum',
            members: [
                { name: 'A', value: 'updated' }, // Update value
                { name: 'C', value: 'c' } // Add new member
            ]
        });

        primitive.ensure(sourceFile);

        const enumDecl = sourceFile.getEnum('TestEnum');
        expect(enumDecl?.getMember('A')?.getValue()).toBe('updated');
        expect(enumDecl?.getMember('C')?.getValue()).toBe('c');
    });
});
