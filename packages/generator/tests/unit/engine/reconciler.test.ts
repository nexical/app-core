import { describe, it, expect, beforeEach } from 'vitest';
import { Project, SourceFile } from 'ts-morph';
import { Reconciler } from '@nexical/generator/engine/reconciler';
import type { FileDefinition } from '@nexical/generator/engine/types';

describe('Reconciler', () => {
    let project: Project;
    let sourceFile: SourceFile;

    beforeEach(() => {
        project = new Project({ useInMemoryFileSystem: true });
        sourceFile = project.createSourceFile('test.ts', '');
    });

    it('should reconcile header', () => {
        const definition: FileDefinition = {
            header: '// Custom Header\n'
        };

        Reconciler.reconcile(sourceFile, definition);
        expect(sourceFile.getFullText()).toContain('// Custom Header');
    });

    it('should reconcile imports', () => {
        const definition: FileDefinition = {
            imports: [{ moduleSpecifier: './foo', namedImports: ['Bar'] }]
        };

        Reconciler.reconcile(sourceFile, definition);
        expect(sourceFile.getImportDeclaration('./foo')).toBeDefined();
    });

    it('should reconcile classes with properties and methods', () => {
        const definition: FileDefinition = {
            classes: [{
                name: 'TestClass',
                properties: [{ name: 'prop', type: 'string' }],
                methods: [{ name: 'method', statements: [{ kind: 'return', expression: '"hello"' }] }]
            }]
        };

        Reconciler.reconcile(sourceFile, definition);
        const classNode = sourceFile.getClass('TestClass');
        expect(classNode).toBeDefined();
        expect(classNode?.getProperty('prop')).toBeDefined();
        expect(classNode?.getMethod('method')).toBeDefined();
    });

    it('should reconcile interfaces, enums, and functions', () => {
        const definition: FileDefinition = {
            interfaces: [{ name: 'ITest' }],
            enums: [{ name: 'TestEnum', members: [{ name: 'A', value: 1 }, { name: 'B', value: 2 }] }],
            functions: [{ name: 'testFunc' }]
        };

        Reconciler.reconcile(sourceFile, definition);
        expect(sourceFile.getInterface('ITest')).toBeDefined();
        expect(sourceFile.getEnum('TestEnum')).toBeDefined();
        expect(sourceFile.getFunction('testFunc')).toBeDefined();
    });

    it('should reconcile modules and types', () => {
        const definition: FileDefinition = {
            modules: [{ name: 'TestModule' }],
            types: [{ name: 'TestType', type: 'string' }]
        };

        Reconciler.reconcile(sourceFile, definition);
        expect(sourceFile.getModule('TestModule')).toBeDefined();
        expect(sourceFile.getTypeAlias('TestType')).toBeDefined();
    });

    it('should reconcile raw statements', () => {
        const definition: FileDefinition = {
            statements: ['console.log("hello");']
        } as any;

        Reconciler.reconcile(sourceFile, definition);
        expect(sourceFile.getFullText()).toContain('console.log("hello");');
    });

    it('should validate correctly', () => {
        const definition: FileDefinition = {
            classes: [{ name: 'TestClass' }]
        };

        // Initially invalid
        let result = Reconciler.validate(sourceFile, definition);
        expect(result.valid).toBe(false);
        expect(result.issues).toContain("Class 'TestClass' is missing.");

        // Reconcile and validate
        Reconciler.reconcile(sourceFile, definition);
        result = Reconciler.validate(sourceFile, definition);
        expect(result.valid).toBe(true);
    });

    it('should handle errors in reconcile', () => {
        const definition: FileDefinition = {
            classes: [{ name: 'TestClass', properties: [null as any] }]
        };

        expect(() => Reconciler.reconcile(sourceFile, definition)).toThrow(/Failed to reconcile file/);
    });
});
