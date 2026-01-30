import { describe, it, expect, beforeEach } from 'vitest';
import { Project, SourceFile } from 'ts-morph';
import { ServiceBuilder } from '@nexical/generator/engine/builders/service-builder';
import { type ModelDef } from '@nexical/generator/engine/types';

describe('ServiceBuilder', () => {
  let project: Project;
  let sourceFile: SourceFile;
  const model: ModelDef = {
    name: 'User',
    fields: {
      id: { type: 'string', isRequired: true, isList: false, attributes: [], api: true },
      name: { type: 'string', isRequired: true, isList: false, attributes: [], api: true },
    },
    api: true,
  };

  beforeEach(() => {
    project = new Project({ useInMemoryFileSystem: true });
    sourceFile = project.createSourceFile('UserService.ts', '');
  });

  it('should generate a full CRUD service class', () => {
    const builder = new ServiceBuilder(model);
    builder.ensure(sourceFile);

    const text = sourceFile.getFullText();
    expect(text).toContain('export class UserService');
    expect(text).toContain('static async list');
    expect(text).toContain('static async get');
    expect(text).toContain('static async create');
    expect(text).toContain('static async update');
    expect(text).toContain('static async delete');
    expect(text).toContain("HookSystem.filter('user.beforeList'");
  });

  it('should block unsafe delete if disabled', () => {
    const builder = new ServiceBuilder(model, false);
    builder.ensure(sourceFile);

    const text = sourceFile.getFullText();
    expect(text).toContain('unsafe_delete_blocked');
  });

  it('should preserve existing method bodies', () => {
    const existingFile = project.createSourceFile(
      'ExistingService.ts',
      `
            export class UserService {
                static async list() {
                    return "custom list";
                }
            }
        `,
    );
    const builder = new ServiceBuilder(model);
    builder.ensure(existingFile);

    const text = existingFile.getFullText();
    expect(text).toContain('return "custom list";');
  });
});
