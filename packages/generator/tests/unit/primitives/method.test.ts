import { describe, it, expect } from 'vitest';
import { createTestProject } from '../../helpers/test-project';
import { MethodPrimitive } from '../../../src/engine/primitives/nodes/method';
import { ClassPrimitive } from '../../../src/engine/primitives/nodes/class';

describe('MethodPrimitive', () => {
    it('should add a method to a class', () => {
        const testProject = createTestProject();
        const sourceFile = testProject.createSourceFile('test.ts', 'class TestClass {}');
        const classNode = sourceFile.getClass('TestClass')!;

        const primitive = new MethodPrimitive({
            name: 'testMethod',
            returnType: 'string',
            statements: 'return "hello";'
        });

        primitive.ensure(classNode);

        const method = classNode.getMethod('testMethod');
        expect(method).toBeDefined();
        expect(method?.getReturnType().getText()).toBe('string');
        // Check implementation via simple text match for now
        expect(method?.getBodyText()).toContain('return "hello";');
    });

    it('should update an existing method', () => {
        const testProject = createTestProject();
        const sourceFile = testProject.createSourceFile('test.ts', `
            class TestClass {
                testMethod(): number { return 1; }
            }
        `);
        const classNode = sourceFile.getClass('TestClass')!;

        const primitive = new MethodPrimitive({
            name: 'testMethod',
            returnType: 'string', // Changed return type
            statements: 'return "updated";',
            overwriteBody: true
        });

        primitive.ensure(classNode);

        const method = classNode.getMethod('testMethod');
        expect(method?.getReturnType().getText()).toBe('string');
        expect(method?.getBodyText()).toContain('return "updated";');
    });

    it('should handle async methods', () => {
        const testProject = createTestProject();
        const sourceFile = testProject.createSourceFile('test.ts', 'class TestClass {}');
        const classNode = sourceFile.getClass('TestClass')!;

        const primitive = new MethodPrimitive({
            name: 'asyncMethod',
            isAsync: true,
            returnType: 'Promise<void>',
        });

        primitive.ensure(classNode);

        const method = classNode.getMethod('asyncMethod');
        expect(method?.isAsync()).toBe(true);
    });
});
