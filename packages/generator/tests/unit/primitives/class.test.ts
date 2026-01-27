import { describe, it, expect } from 'vitest';
import { createTestProject } from '../../helpers/test-project';
import { ClassPrimitive } from '../../../src/engine/primitives/nodes/class';

describe('ClassPrimitive', () => {
    it('should create a new class if it does not exist', () => {
        const testProject = createTestProject();
        const sourceFile = testProject.createSourceFile('test.ts', '');

        const primitive = new ClassPrimitive({
            name: 'TestClass',
            isExported: true,
        });

        primitive.ensure(sourceFile);

        const classDeclaration = sourceFile.getClass('TestClass');
        expect(classDeclaration).toBeDefined();
        expect(classDeclaration?.isExported()).toBe(true);
    });

    it('should update an existing class', () => {
        const testProject = createTestProject();
        const sourceFile = testProject.createSourceFile('test.ts', 'class TestClass {}');

        const primitive = new ClassPrimitive({
            name: 'TestClass',
            isExported: true,
            extends: 'BaseClass',
        });

        primitive.ensure(sourceFile);

        const classDeclaration = sourceFile.getClass('TestClass');
        expect(classDeclaration).toBeDefined();
        expect(classDeclaration?.isExported()).toBe(true);
        expect(classDeclaration?.getExtends()?.getText()).toBe('BaseClass');
    });

    it('should implement interfaces', () => {
        const testProject = createTestProject();
        const sourceFile = testProject.createSourceFile('test.ts', '');

        const primitive = new ClassPrimitive({
            name: 'TestClass',
            implements: ['InterfaceA', 'InterfaceB'],
        });

        primitive.ensure(sourceFile);

        const classDeclaration = sourceFile.getClass('TestClass');
        const implementsClauses = classDeclaration?.getImplements().map(i => i.getText());
        expect(implementsClauses).toContain('InterfaceA');
        expect(implementsClauses).toContain('InterfaceB');
    });
});
