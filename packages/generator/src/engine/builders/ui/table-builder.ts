import { Project, SourceFile } from 'ts-morph';
import { UiBaseBuilder } from './ui-base-builder.js';
import path from 'node:path';
import { type FileDefinition, type ModelDef, type ModuleConfig } from '../../types.js';
import { Reconciler } from '../../reconciler.js';
import { toKebabCase, toPascalCase } from '../../../utils/string.js';

export class TableBuilder extends UiBaseBuilder {
  constructor(
    protected moduleName: string,
    protected config: ModuleConfig,
  ) {
    super(moduleName, config);
  }

  async build(project: Project, sourceFile: SourceFile | undefined): Promise<void> {
    this.loadUiConfig();
    const models = this.resolveModels();
    if (!models || models.length === 0) return;

    for (const model of models) {
      if (!model.api) continue;

      const componentName = `${toPascalCase(model.name)}Table`;
      const fileName = path.join(
        process.cwd(),
        'modules',
        this.moduleName,
        'src/components',
        `${componentName}.tsx`,
      );

      const file = project.createSourceFile(fileName, '', { overwrite: true });

      const definition: FileDefinition = {
        header: this.getHeader(),
        imports: [
          {
            moduleSpecifier: 'react',
            namedImports: ['useState'],
          },
          {
            moduleSpecifier: `@/hooks/use-${toKebabCase(model.name)}`,
            namedImports: [
              `use${toPascalCase(model.name)}Query`,
              `useDelete${toPascalCase(model.name)}`,
            ],
          },
          {
            moduleSpecifier: `@modules/${this.uiConfig.backend || this.moduleName}/permissions`,
            namedImports: ['Permission'],
          },
          {
            moduleSpecifier: '@/hooks/use-auth',
            namedImports: ['useAuth'],
          },
        ],
        functions: [this.generateFunctionConfig(model, componentName)],
      };

      Reconciler.reconcile(file, definition);
    }
  }

  private generateFunctionConfig(model: ModelDef, componentName: string): any {
    const modelName = toPascalCase(model.name);
    const hookName = `use${modelName}Query`;
    const deleteHookName = `useDelete${modelName}`;

    // Fields for columns
    const columns = Object.entries(model.fields)
      .filter(([name, f]) => !f.private && f.type !== 'Json' && !f.isRelation)
      .map(([name]) => name);

    const statements: any[] = [
      {
        kind: 'variable',
        declarationKind: 'const',
        declarations: [{ name: '{ data, isLoading }', initializer: `${hookName}()` }],
      },
      {
        kind: 'variable',
        declarationKind: 'const',
        declarations: [{ name: 'deleteMutation', initializer: `${deleteHookName}()` }],
      },
      {
        kind: 'variable',
        declarationKind: 'const',
        declarations: [{ name: '{ user }', initializer: 'useAuth()' }],
      },
      {
        kind: 'variable',
        declarationKind: 'const',
        declarations: [
          {
            name: 'canDelete',
            initializer: `Permission.check('${model.name.toLowerCase()}:delete', user?.role || 'ANONYMOUS')`,
          },
        ],
      },
      {
        kind: 'if',
        condition: 'isLoading',
        then: {
          kind: 'return',
          expression: {
            kind: 'jsx',
            tagName: 'div',
            children: ['Loading...'],
          },
        },
      },
    ];

    // Build Table Headers JSX
    const headers = columns.map((col) => ({
      kind: 'jsx',
      tagName: 'th',
      attributes: [
        {
          name: 'className',
          value: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        },
      ],
      children: [col],
    }));
    headers.push({
      kind: 'jsx',
      tagName: 'th',
      attributes: [
        {
          name: 'className',
          value: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        },
      ],
      children: ['Actions'],
    });

    // Build Table Body Rows Mapper
    const rowMapper = `data?.data?.map((item: any) => (
      <tr key={item.id}>
        ${columns.map((col) => `<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{String(item.${col})}</td>`).join('\n')}
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          {canDelete && (
             <button className="text-red-600 hover:text-red-900" onClick={() => deleteMutation.mutate(item.id)}>Delete</button>
          )}
        </td>
      </tr>
    ))`;

    statements.push({
      kind: 'return',
      expression: {
        kind: 'jsx',
        tagName: 'div',
        attributes: [{ name: 'className', value: 'overflow-x-auto' }],
        children: [
          {
            kind: 'jsx',
            tagName: 'table',
            attributes: [{ name: 'className', value: 'min-w-full divide-y divide-gray-200' }],
            children: [
              {
                kind: 'jsx',
                tagName: 'thead',
                attributes: [{ name: 'className', value: 'bg-gray-50' }],
                children: [
                  {
                    kind: 'jsx',
                    tagName: 'tr',
                    children: headers,
                  },
                ],
              },
              {
                kind: 'jsx',
                tagName: 'tbody',
                attributes: [{ name: 'className', value: 'bg-white divide-y divide-gray-200' }],
                children: [{ kind: 'expression', expression: rowMapper }],
              },
            ],
          },
        ],
      },
    });

    return {
      name: componentName,
      isExported: true,
      statements,
    };
  }

  private getHeader(): string {
    return '// GENERATED CODE - DO NOT MODIFY\n// This file was generated by the TableBuilder.';
  }
}
