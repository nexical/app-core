import { describe, it, expect, beforeEach } from 'vitest';
import { Project, SourceFile, Scope } from 'ts-morph';
import { AccessorPrimitive } from '../../../src/engine/primitives/nodes/accessor';

describe('AccessorPrimitive', () => {
    let project: Project;
    let sourceFile: SourceFile;

    beforeEach(() => {
        project = new Project({ useInMemoryFileSystem: true });
        sourceFile = project.createSourceFile('test.ts', 'class TestClass { private _name: string = ""; }');
    });

    it('should create a getter', () => {
        const classNode = sourceFile.getClass('TestClass');
        const primitive = new AccessorPrimitive({
            name: 'name',
            kind: 'get',
            returnType: 'string',
            scope: Scope.Public,
            statements: 'return this._name;'
        });

        primitive.ensure(classNode!);

        const getter = classNode?.getGetAccessor('name');
        expect(getter).toBeDefined();
        expect(getter?.getReturnType().getText()).toBe('string');
        expect(getter?.getBodyText()).toContain('return this._name;');
    });

    it('should create a setter', () => {
        const classNode = sourceFile.getClass('TestClass');
        const primitive = new AccessorPrimitive({
            name: 'name',
            kind: 'set',
            parameters: [{ name: 'value', type: 'string' }],
            scope: Scope.Public,
            statements: 'this._name = value;'
        });

        primitive.ensure(classNode!);

        const setter = classNode?.getSetAccessor('name');
        expect(setter).toBeDefined();
        expect(setter?.getParameters()[0].getName()).toBe('value');
        expect(setter?.getBodyText()).toContain('this._name = value;');
    });

    it('should update a getter', () => {
        const classNode = sourceFile.getClass('TestClass');
        classNode?.addGetAccessor({ name: 'name', returnType: 'any', statements: 'return null;' });

        const primitive = new AccessorPrimitive({
            name: 'name',
            kind: 'get',
            returnType: 'string',
            statements: 'return this._name;'
        });

        primitive.ensure(classNode!);

        const getter = classNode?.getGetAccessor('name');
        expect(getter?.getReturnType().getText()).toBe('string');
        expect(getter?.getBodyText()).toContain('return this._name;');
    });
});
