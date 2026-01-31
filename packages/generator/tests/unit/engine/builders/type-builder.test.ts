import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { TypeBuilder } from '../../../../src/engine/builders/type-builder';
import { type ModelDef, type EnumConfig } from '../../../../src/engine/types';

describe('TypeBuilder', () => {
  it('should generate interfaces for virtual models', () => {
    const models: ModelDef[] = [
      {
        name: 'VirtualUser',
        db: false,
        api: true,
        fields: {
          name: { type: 'String', isRequired: true, isList: false, attributes: [], api: true },
        },
      },
    ];

    const builder = new TypeBuilder(models);
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile('test.ts', '');

    builder.ensure(sourceFile);

    const iface = sourceFile.getInterface('VirtualUser');
    expect(iface).toBeDefined();
    expect(iface?.isExported()).toBe(true);
    expect(iface?.getProperty('name')?.getType().getText()).toBe('string');
  });

  it('should generate enums as const object and type', () => {
    const enums: EnumConfig[] = [
      {
        name: 'SiteRole',
        members: [
          { name: 'ADMIN', value: 'ADMIN' },
          { name: 'USER', value: 'USER' },
        ],
      },
    ];

    const builder = new TypeBuilder([], enums);
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile('test.ts', '');

    builder.ensure(sourceFile);

    const variable = sourceFile.getVariableStatement('SiteRole');
    expect(variable).toBeDefined();
    expect(variable?.getDeclarations()[0].getType().getText()).toContain(
      '{ readonly ADMIN: "ADMIN"; readonly USER: "USER"; }',
    );

    const typeAlias = sourceFile.getTypeAlias('SiteRole');
    expect(typeAlias).toBeDefined();
    expect(typeAlias?.getTypeNode()?.getText()).toBe('(typeof SiteRole)[keyof typeof SiteRole]');
  });
});
