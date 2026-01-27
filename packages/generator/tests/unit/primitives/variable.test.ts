import { describe, it, expect, beforeEach } from 'vitest';
import { Project, SourceFile, VariableDeclarationKind } from 'ts-morph';
import { VariablePrimitive } from '../../../src/engine/primitives/nodes/variable';

describe('VariablePrimitive', () => {
    let project: Project;
    let sourceFile: SourceFile;

    beforeEach(() => {
        project = new Project({ useInMemoryFileSystem: true });
        sourceFile = project.createSourceFile('test.ts', '');
    });

    it('should create a new variable', () => {
        const primitive = new VariablePrimitive({
            name: 'API_URL',
            type: 'string',
            initializer: '"https://api.example.com"',
            declarationKind: 'const',
            isExported: true
        });

        primitive.ensure(sourceFile);

        const variable = sourceFile.getVariableStatement('API_URL');
        expect(variable).toBeDefined();
        expect(variable?.isExported()).toBe(true);
        expect(variable?.getDeclarationKind()).toBe(VariableDeclarationKind.Const);

        const decl = variable?.getDeclarations()[0];
        expect(decl?.getName()).toBe('API_URL');
        expect(decl?.getType().getText()).toBe('string');
        expect(decl?.getInitializer()?.getText()).toBe('"https://api.example.com"');
    });

    it('should update an existing variable initializer', () => {
        sourceFile.addVariableStatement({
            declarationKind: VariableDeclarationKind.Const,
            isExported: true,
            declarations: [{
                name: 'MAX_RETRIES',
                type: 'number',
                initializer: '3'
            }]
        });

        const primitive = new VariablePrimitive({
            name: 'MAX_RETRIES',
            type: 'number',
            initializer: '5',
            declarationKind: 'const'
        });

        primitive.ensure(sourceFile);

        const variable = sourceFile.getVariableStatement('MAX_RETRIES');
        const decl = variable?.getDeclarations()[0];
        expect(decl?.getInitializer()?.getText()).toBe('5');
    });
});
