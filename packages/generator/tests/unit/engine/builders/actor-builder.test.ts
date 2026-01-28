import { describe, it, expect, beforeEach } from 'vitest';
import { Project, SourceFile } from 'ts-morph';
import { ActorBuilder } from '@nexical/generator/engine/builders/actor-builder';
import { type ModelDef } from '@nexical/generator/engine/types';

describe('ActorBuilder', () => {
    let project: Project;
    let sourceFile: SourceFile;

    beforeEach(() => {
        project = new Project({ useInMemoryFileSystem: true });
        sourceFile = project.createSourceFile('actors.ts', '');
    });

    it('should generate login strategy actor', () => {
        const models: ModelDef[] = [
            {
                name: 'User',
                actor: { strategy: 'login', fields: { identifier: 'email', secret: 'password' } },
                fields: { email: { type: 'string', isRequired: true, isList: false, attributes: [], api: true } }
            }
        ];
        const builder = new ActorBuilder(models);
        builder.ensure(sourceFile);

        const text = sourceFile.getFullText();
        expect(text).toContain('user: async (client: ApiClient, params: any = {}) =>');
        expect(text).toMatch(/client\.useSession\(\)\.post\(['"]\/api\/login['"]/);
        expect(text).toContain('email: actor.email');
    });

    it('should generate bearer strategy actor with hashing', () => {
        const models: ModelDef[] = [
            {
                name: 'Team',
                actor: { strategy: 'bearer', prefix: 'tm_', fields: { keyField: 'hashedKey' } },
                fields: {}
            }
        ];
        const builder = new ActorBuilder(models);
        builder.ensure(sourceFile);

        const text = sourceFile.getFullText();
        expect(text).toMatch(/import crypto from ["']node:crypto["'];/);
        expect(text).toMatch(/crypto\.createHash\(['"]sha256["']\)\.update\(rawKey\)\.digest\(['"]hex["']\)/);
        expect(text).toMatch(/prefix: ["']tm_["']/);
    });

    it('should generate api-key strategy actor', () => {
        const models: ModelDef[] = [
            {
                name: 'ServiceAccount',
                actor: {
                    strategy: 'api-key',
                    fields: { keyModel: 'ApiKey', ownerField: 'accountId' }
                },
                fields: {}
            }
        ];
        const builder = new ActorBuilder(models);
        builder.ensure(sourceFile);

        const text = sourceFile.getFullText();
        expect(text).toContain('accountId: actor.id');
        expect(text).toContain('Factory.prisma.serviceAccount.findUnique');
        expect(text).toContain('client.useToken(rawKey)');
    });

    it('should generate empty actors object if no actors defined', () => {
        const models: ModelDef[] = [{ name: 'Profile', fields: {} }];
        const builder = new ActorBuilder(models);
        builder.ensure(sourceFile);

        expect(sourceFile.getFullText()).toMatch(/export const actors = \{[\s\n]*\};/);
    });
});
