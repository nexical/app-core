import { describe, it, expect } from 'vitest';
import { createTestProject } from '../../helpers/test-project';
import { FunctionPrimitive } from '../../../src/engine/primitives/nodes/function';

describe('FunctionPrimitive', () => {
    it('should create a new function', () => {
        const testProject = createTestProject();
        const sourceFile = testProject.createSourceFile('test.ts', '');

        const primitive = new FunctionPrimitive({
            name: 'testFunction',
            isExported: true,
            returnType: 'void',
            parameters: [{ name: 'arg', type: 'string' }],
            statements: 'console.log(arg);'
        });

        primitive.ensure(sourceFile);

        const func = sourceFile.getFunction('testFunction');
        expect(func).toBeDefined();
        expect(func?.isExported()).toBe(true);
        expect(func?.getReturnType().getText()).toBe('void');
        expect(func?.getParameters()[0].getName()).toBe('arg');
    });

    it('should update an existing function', () => {
        const testProject = createTestProject();
        const sourceFile = testProject.createSourceFile('test.ts', 'export function testFunction() {}');

        const primitive = new FunctionPrimitive({
            name: 'testFunction',
            isAsync: true,
            returnType: 'Promise<string>',
            statements: 'return "updated";',
            overwriteBody: true
        });

        primitive.ensure(sourceFile);

        const func = sourceFile.getFunction('testFunction');
        expect(func?.isAsync()).toBe(true);
        expect(func?.getReturnType().getText()).toBe('Promise<string>');
        expect(func?.getBodyText()).toContain('return "updated";');
    });
});
