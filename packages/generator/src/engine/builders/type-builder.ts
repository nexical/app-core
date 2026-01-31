import {
  type ModelDef,
  type FileDefinition,
  type InterfaceConfig,
  type EnumConfig,
  type NodeContainer,
  type ImportConfig,
  type StatementConfig,
} from '../types.js';
import { BaseBuilder } from './base-builder.js';
import { TemplateLoader } from '../../utils/template-loader.js';

export class TypeBuilder extends BaseBuilder {
  constructor(
    private models: ModelDef[],
    private enums: EnumConfig[] = [],
  ) {
    super();
  }

  protected getSchema(node?: NodeContainer): FileDefinition {
    const dbModels = this.models.filter((m) => m.db);
    const virtualModels = this.models.filter((m) => !m.db);

    const interfaces: InterfaceConfig[] = [];
    const imports: ImportConfig[] = [];
    const exportsConfig = [];

    const statements: (string | StatementConfig)[] = [];
    for (const enumDef of this.enums) {
      const members = enumDef.members.map((m) => `    ${m.name}: '${m.value}'`).join(',\n');
      statements.push(
        TemplateLoader.load('type/enum.tsf', {
          enumName: enumDef.name,
          members,
        }),
      );
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
        if (type === 'Json') type = 'unknown';

        if (field.isList) type = `${type}[]`;

        return {
          name: fieldName,
          type: type,
          optional: !field.isRequired,
        };
      });

      if (properties.length === 0) {
        interfaces.push({
          name: model.name,
          isExported: true,
          properties,
          comments: ['// eslint-disable-next-line @typescript-eslint/no-empty-object-type'],
        });
      } else {
        interfaces.push({
          name: model.name,
          isExported: true,
          properties,
        });
      }
    }

    return {
      header: '// GENERATED CODE - DO NOT MODIFY BY HAND',
      imports: imports,
      exports: exportsConfig,
      interfaces: interfaces,
      statements: statements,
    };
  }
}
