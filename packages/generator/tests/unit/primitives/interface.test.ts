import { describe, it, expect } from 'vitest';
import { createTestProject } from '../../helpers/test-project';
import { InterfacePrimitive } from '../../../src/engine/primitives/nodes/interface';

describe('InterfacePrimitive', () => {
    it('should create a new interface', () => {
        const testProject = createTestProject();
        const sourceFile = testProject.createSourceFile('test.ts', '');

        const primitive = new InterfacePrimitive({
            name: 'TestInterface',
            isExported: true,
            properties: [
                { name: 'id', type: 'string' },
                { name: 'count', type: 'number', optional: true }
            ]
        });

        primitive.ensure(sourceFile);

        const interfaceDecl = sourceFile.getInterface('TestInterface');
        expect(interfaceDecl).toBeDefined();
        expect(interfaceDecl?.isExported()).toBe(true);

        const idProp = interfaceDecl?.getProperty('id');
        expect(idProp?.getType().getText()).toBe('string');
        expect(idProp?.hasQuestionToken()).toBe(false);

        const countProp = interfaceDecl?.getProperty('count');
        expect(countProp?.getType().getText()).toBe('number');
        expect(countProp?.hasQuestionToken()).toBe(true);
    });

    it('should update an existing interface', () => {
        const testProject = createTestProject();
        const sourceFile = testProject.createSourceFile('test.ts', 'interface TestInterface { id: number; }');

        const primitive = new InterfacePrimitive({
            name: 'TestInterface',
            properties: [
                { name: 'id', type: 'string' }, // Changed type
                { name: 'name', type: 'string' } // New prop
            ]
        });

        primitive.ensure(sourceFile);

        const interfaceDecl = sourceFile.getInterface('TestInterface');
        expect(interfaceDecl?.getProperty('id')?.getType().getText()).toBe('string');
        expect(interfaceDecl?.getProperty('name')).toBeDefined();
    });
});
