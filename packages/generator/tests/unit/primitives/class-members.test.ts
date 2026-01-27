import { describe, it, expect, beforeEach } from 'vitest';
import { Project, SourceFile, Scope } from 'ts-morph';
import { ConstructorPrimitive } from '../../../src/engine/primitives/nodes/constructor';
import { PropertyPrimitive } from '../../../src/engine/primitives/nodes/property';

describe('PropertyPrimitive', () => {
    let project: Project;
    let sourceFile: SourceFile;

    beforeEach(() => {
        project = new Project({ useInMemoryFileSystem: true });
        sourceFile = project.createSourceFile('test.ts', 'class TestClass {}');
    });

    it('should create a new property', () => {
        const classNode = sourceFile.getClass('TestClass');
        const primitive = new PropertyPrimitive({
            name: 'count',
            type: 'number',
            initializer: '0',
            scope: Scope.Private
        });

        primitive.ensure(classNode!);

        const prop = classNode?.getProperty('count');
        expect(prop).toBeDefined();
        expect(prop?.getType().getText()).toBe('number');
        expect(prop?.getInitializer()?.getText()).toBe('0');
        expect(prop?.getScope()).toBe(Scope.Private);
    });
});

describe('ConstructorPrimitive', () => {
    let project: Project;
    let sourceFile: SourceFile;

    beforeEach(() => {
        project = new Project({ useInMemoryFileSystem: true });
        sourceFile = project.createSourceFile('test.ts', 'class TestClass {}');
    });

    it('should create a constructor', () => {
        const classNode = sourceFile.getClass('TestClass');
        const primitive = new ConstructorPrimitive({
            parameters: [{ name: 'name', type: 'string', scope: Scope.Public }],
            statements: 'console.log(name);'
        });

        primitive.ensure(classNode!);

        const ctor = classNode?.getConstructors()[0];
        expect(ctor).toBeDefined();
        expect(ctor?.getParameters()[0].getName()).toBe('name');
        expect(ctor?.getParameters()[0].getScope()).toBe(Scope.Public);
        expect(ctor?.getBodyText()).toContain('console.log(name)');
    });
});
