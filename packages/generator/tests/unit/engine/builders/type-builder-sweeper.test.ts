import { describe, it, expect } from 'vitest';
import { TypeBuilder } from '@nexical/generator/engine/builders/type-builder';
import { ModelDef } from '@nexical/generator/engine/types';

describe('TypeBuilder Sweeper', () => {
  it('should generate Prisma client exports for DB models', () => {
    const models: ModelDef[] = [
      { name: 'User', db: true, fields: { id: { type: 'String', isRequired: true } } },
    ];
    const builder = new TypeBuilder(models);
    const file = (builder as any).getSchema();

    const prismaExport = file.exports.find((e: any) => e.moduleSpecifier === '@prisma/client');
    expect(prismaExport).toBeDefined();
    expect(prismaExport.exportClause).toContain('User');
  });

  it('should generate Interfaces for Virtual models', () => {
    const models: ModelDef[] = [
      {
        name: 'Virtual',
        db: false,
        fields: {
          id: { type: 'String', isRequired: true },
          count: { type: 'Int', isRequired: true },
          tags: { type: 'String', isRequired: true, isList: true },
        },
      },
    ];
    const builder = new TypeBuilder(models);
    const file = (builder as any).getSchema();

    const iface = file.interfaces.find((i: any) => i.name === 'Virtual');
    expect(iface).toBeDefined();
    expect(iface.properties).toBeDefined();
    expect(iface.properties.find((p: any) => p.name === 'id')?.type).toBe('string');
    expect(iface.properties.find((p: any) => p.name === 'count')?.type).toBe('number');
    expect(iface.properties.find((p: any) => p.name === 'tags')?.type).toBe('string[]');
  });

  it('should generate Enum types', () => {
    const enums = [{ name: 'Role', members: [{ name: 'ADMIN', value: 'ADMIN' }] }];
    const builder = new TypeBuilder([], enums);
    const file = (builder as any).getSchema();

    expect(file.variables[0].name).toBe('Role');
    expect(file.types[0].name).toBe('Role');
    expect(file.types[0].type).toContain('keyof typeof Role');
  });
});
