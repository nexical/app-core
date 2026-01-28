import { describe, it, expect, beforeEach } from 'vitest';
import { Project, SourceFile } from 'ts-morph';
import { ApiBuilder } from '@nexical/generator/engine/builders/api-builder';
import { type ModelDef } from '@nexical/generator/engine/types';

describe('ApiBuilder', () => {
    let project: Project;
    let sourceFile: SourceFile;
    const model: ModelDef = {
        name: 'User',
        fields: {
            id: { type: 'String', isRequired: true, isList: false, attributes: ['@default(cuid())'], api: true },
            email: { type: 'String', isRequired: true, isList: false, attributes: [], api: true },
            age: { type: 'Int', isRequired: false, isList: false, attributes: [], api: true }
        },
        api: true
    };

    beforeEach(() => {
        project = new Project({ useInMemoryFileSystem: true });
        sourceFile = project.createSourceFile(`api-${Math.random().toString(36).substring(7)}.ts`, '');
    });

    it('should generate collection schema (GET/POST)', () => {
        const builder = new ApiBuilder(model, [model], 'user-api', 'collection');
        builder.ensure(sourceFile);

        const text = sourceFile.getFullText();
        expect(text).toContain('export const GET = defineApi');
        expect(text).toContain('export const POST = defineApi');
        expect(text).toContain('UserService.list');
        expect(text).toContain('UserService.create');
        expect(text).toContain('z.object({');
        expect(text).toContain('email: z.string()');
    });

    it('should generate individual schema (GET/PUT/DELETE)', () => {
        const builder = new ApiBuilder(model, [model], 'user-api', 'individual');
        builder.ensure(sourceFile);

        const text = sourceFile.getFullText();
        expect(text).toContain('export const GET = defineApi');
        expect(text).toContain('export const PUT = defineApi');
        expect(text).toContain('export const DELETE = defineApi');
        expect(text).toContain('UserService.get(id, select)');
        expect(text).toContain('UserService.update(id, validated, select, actor)');
        expect(text).toContain('UserService.delete(id)');
    });

    it('should generate custom schema for actions', () => {
        const routes = [{
            method: 'resetPassword',
            path: '/reset-password',
            verb: 'POST' as const,
            input: 'ResetPasswordInput',
            output: 'void',
            role: 'member'
        }];
        const builder = new ApiBuilder(model, [model], 'user-api', 'custom', routes);
        builder.ensure(sourceFile);

        const text = sourceFile.getFullText();
        expect(text).toContain('export const POST = defineApi');
        expect(text).toContain('ResetPasswordUserAction.run');
        expect(text).toContain('import { ResetPasswordUserAction } from "@modules/user-api/src/actions/reset-password-user"');
    });

    it('should handle role-based restriction in API generation', () => {
        const restrictedModel: ModelDef = {
            ...model,
            role: { list: 'admin', create: 'none' }
        };
        const builder = new ApiBuilder(restrictedModel, [restrictedModel], 'user-api', 'collection');
        builder.ensure(sourceFile);

        const text = sourceFile.getFullText();
        expect(text).toContain('GET');
        expect(text).not.toContain('POST');
        expect(text).toContain("ApiGuard.protect(context, 'admin'");
    });
});
