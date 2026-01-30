import { SourceFile } from 'ts-morph';
import {
  type ModelDef,
  type FileDefinition,
  type InterfaceConfig,
  type EnumConfig,
} from '../types';
import { Reconciler } from '../reconciler';
import { BaseBuilder } from './base-builder';

export class TypeBuilder extends BaseBuilder {
  constructor(
    private models: ModelDef[],
    private enums: EnumConfig[] = [],
  ) {
    super();
  }

  protected getSchema(node?: any): FileDefinition {
    // ... existing logic ...
    const dbModels = this.models.filter((m) => m.db);
    const virtualModels = this.models.filter((m) => !m.db);

    const interfaces: InterfaceConfig[] = [];

    const imports: any[] = [];
    const exportsConfig = [];

    const enumVariables: any[] = [];
    const enumTypes: any[] = [];

    for (const enumDef of this.enums) {
      // 1. Generate const object
      // export const SiteRole = { ADMIN: 'ADMIN', ... } as const;
      const initializerBody = enumDef.members.map((m) => `    ${m.name}: '${m.value}'`).join(',\n');
      enumVariables.push({
        name: enumDef.name,
        declarationKind: 'const',
        isExported: true,
        initializer: `{\n${initializerBody}\n} as const`,
      });

      // 2. Generate Type
      // export type SiteRole = (typeof SiteRole)[keyof typeof SiteRole];
      enumTypes.push({
        name: enumDef.name,
        isExported: true,
        type: `(typeof ${enumDef.name})[keyof typeof ${enumDef.name}]`,
      });
    }

    if (dbModels.length > 0) {
      exportsConfig.push({
        moduleSpecifier: '@prisma/client',
        exportClause: dbModels.map((m) => m.name),
        isTypeOnly: true,
      });
    }

    // 2. Generate Interfaces for Virtual Models
    for (const model of virtualModels) {
      const properties = Object.entries(model.fields).map(([fieldName, field]) => {
        let type = field.type;
        // Map basic types or keep as is
        if (type === 'String') type = 'string';
        if (type === 'Int') type = 'number';
        if (type === 'Float') type = 'number';
        if (type === 'Boolean') type = 'boolean';
        if (type === 'DateTime') type = 'Date';
        if (type === 'Json') type = 'any';

        if (field.isList) type = `${type}[]`;

        return {
          name: fieldName,
          type: type,
          optional: !field.isRequired,
        };
      });

      interfaces.push({
        name: model.name,
        isExported: true,
        properties,
      });
    }

    return {
      imports: imports,
      exports: exportsConfig,
      interfaces: interfaces,
      variables: enumVariables,
      types: enumTypes,
    };
  }
}
