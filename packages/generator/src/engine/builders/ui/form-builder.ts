import { Project, SourceFile } from 'ts-morph';
import { UiBaseBuilder } from './ui-base-builder.js';
import path from 'node:path';
import {
  type FileDefinition,
  type ModelDef,
  type ModuleConfig,
  type JsxElementConfig,
} from '../../types.js';
import { Reconciler } from '../../reconciler.js';
import { toKebabCase, toPascalCase } from '../../../utils/string.js';
import { ZodHelper } from '../utils/zod-helper.js';
import { JsxElementPrimitive } from '../../primitives/jsx/element.js';

export class FormBuilder extends UiBaseBuilder {
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

    // Extract all models for resolving relations in ZodHelper
    const allModels = models;

    for (const model of models) {
      // ONLY generate forms if listed in uiConfig.forms
      if (!this.uiConfig.forms || !this.uiConfig.forms[model.name]) {
        continue;
      }

      const formConfig = this.uiConfig.forms[model.name];

      if (!model.api) continue;

      const componentName = `${toPascalCase(model.name)}Form`;
      const fileName = path.join(
        process.cwd(),
        'modules',
        this.moduleName,
        'src/components',
        `${componentName}.tsx`,
      );

      const file = project.createSourceFile(fileName, '', { overwrite: true });

      // Collect custom component imports
      const customImports: Set<string> = new Set();
      Object.values(formConfig).forEach((fieldConfig: any) => {
        if (fieldConfig.component && fieldConfig.component.path) {
          // We need to handle named imports. Assuming component.name is the named export.
          // Store as JSON string to dedupe, then parse back.
          customImports.add(
            JSON.stringify({
              moduleSpecifier: fieldConfig.component.path,
              namedImports: [fieldConfig.component.name],
            }),
          );
        }
      });

      const imports = [
        {
          moduleSpecifier: 'react',
          namedImports: ['useEffect'],
        },
        {
          moduleSpecifier: 'react-hook-form',
          namedImports: ['useForm'],
        },
        {
          moduleSpecifier: '@hookform/resolvers/zod',
          namedImports: ['zodResolver'],
        },
        {
          moduleSpecifier: 'zod',
          namedImports: ['z'],
        },
        {
          moduleSpecifier: `@/hooks/use-${toKebabCase(model.name)}`,
          namedImports: [
            `useCreate${toPascalCase(model.name)}`,
            `useUpdate${toPascalCase(model.name)}`,
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
      ];

      // Add custom imports
      customImports.forEach((json) => {
        imports.push(JSON.parse(json));
      });

      const definition: FileDefinition = {
        header: this.getHeader(),
        imports: imports,
        functions: [this.generateFunctionConfig(model, allModels, componentName, formConfig)],
      };

      Reconciler.reconcile(file, definition);
    }
  }

  private generateFunctionConfig(
    model: ModelDef,
    allModels: ModelDef[],
    componentName: string,
    formConfig: Record<string, any>,
  ): any {
    const modelName = toPascalCase(model.name);
    const zodSchema = ZodHelper.generateSchema(model, allModels);

    const statements: any[] = [
      {
        kind: 'variable',
        declarationKind: 'const',
        declarations: [
          { name: 'isEdit', initializer: '!!id' },
          { name: 'createMutation', initializer: `useCreate${modelName}()` },
          { name: 'updateMutation', initializer: `useUpdate${modelName}()` },
        ],
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
            name: 'canCreate',
            initializer: `Permission.check('${model.name.toLowerCase()}:create', user?.role || 'ANONYMOUS')`,
          },
          {
            name: 'canUpdate',
            initializer: `Permission.check('${model.name.toLowerCase()}:update', user?.role || 'ANONYMOUS')`,
          },
        ],
      },
      {
        kind: 'variable',
        declarationKind: 'const',
        declarations: [{ name: 'schema', initializer: zodSchema }],
      },
      {
        raw: 'type FormData = z.infer<typeof schema>;',
        getNodes: () => [],
      },
      // Hook form raw statement for now as it's complex destructuring
      {
        raw: `const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: initialData || {},
    });`,
        getNodes: () => [],
      },
      {
        raw: `useEffect(() => {
        if (initialData) {
            reset(initialData);
        }
    }, [initialData, reset]);`,
        getNodes: () => [],
      },
      {
        raw: `const onSubmit = (data: FormData) => {
        if (isEdit && id) {
            updateMutation.mutate({ id, data }, { onSuccess });
        } else {
            createMutation.mutate(data, { onSuccess });
        }
    };`,
        getNodes: () => [],
      },
    ];

    // Build JSX Fields
    const fieldElements = this.generateFieldElements(model, formConfig);

    // Submit Button
    const submitButton: JsxElementConfig = {
      kind: 'jsx',
      tagName: 'button',
      attributes: [
        { name: 'type', value: 'submit' },
        { name: 'disabled', value: '{isSubmitting}' },
        {
          name: 'className',
          value:
            'inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50',
        },
      ],
      children: [
        {
          kind: 'expression',
          expression: "isSubmitting ? 'Saving...' : (isEdit ? 'Update' : 'Create')",
        },
      ],
    };

    // Wrap button in permission logic
    const conditionalButton = {
      kind: 'expression',
      expression:
        '(isEdit ? canUpdate : canCreate) && ' + new JsxElementPrimitive(submitButton).generate(),
    };

    statements.push({
      kind: 'return',
      expression: {
        kind: 'jsx',
        tagName: 'form',
        attributes: [
          { name: 'onSubmit', value: '{handleSubmit(onSubmit)}' },
          { name: 'className', value: 'space-y-4' },
        ],
        children: [...fieldElements, conditionalButton],
      },
    });

    return {
      name: componentName,
      isExported: true,
      parameters: [
        {
          name: '{ id, initialData, onSuccess }',
          type: '{ id?: string, initialData?: any, onSuccess?: () => void }',
        },
      ],
      statements,
    };
  }

  private generateFieldElements(model: ModelDef, formConfig: Record<string, any>): any[] {
    return Object.entries(model.fields)
      .filter(
        ([name, f]) =>
          // Include if not private OR if explicitly configured in formConfig
          (!f.private || (formConfig && formConfig[name])) &&
          f.type !== 'Json' &&
          !f.isRelation &&
          !['id', 'createdAt', 'updatedAt'].includes(name),
      )
      .map(([name, f]) => {
        const label = toPascalCase(name)
          .replace(/([A-Z])/g, ' $1')
          .trim();

        // Check for Custom Component Override
        const fieldConfig = formConfig[name];
        if (fieldConfig && fieldConfig.component) {
          return {
            kind: 'jsx',
            tagName: 'div',
            children: [
              {
                kind: 'jsx',
                tagName: 'label',
                attributes: [
                  { name: 'htmlFor', value: name },
                  { name: 'className', value: 'block text-sm font-medium text-gray-700' },
                ],
                children: [label],
              },
              {
                kind: 'jsx',
                tagName: 'div',
                attributes: [{ name: 'className', value: 'mt-1' }],
                children: [
                  {
                    kind: 'jsx',
                    tagName: fieldConfig.component.name,
                    selfClosing: true,
                    attributes: [
                      { name: 'id', value: name },
                      {
                        name: 'error',
                        value: {
                          kind: 'expression',
                          expression: `errors.${name}?.message as string`,
                        },
                      },
                      // Spread register props correctly
                      { name: `{...register('${name}')}` },
                      // Allow props injection if needed, but for now assumption is standard interface
                    ],
                  },
                ],
              },
            ],
          };
        }

        let inputType = 'text';
        if (f.type === 'Int' || f.type === 'Float') inputType = 'number';
        if (f.type === 'Boolean') inputType = 'checkbox';
        if (f.type === 'DateTime') inputType = 'datetime-local';

        // Standard Input
        return {
          kind: 'jsx',
          tagName: 'div',
          children: [
            {
              kind: 'jsx',
              tagName: 'label',
              attributes: [
                { name: 'htmlFor', value: name },
                { name: 'className', value: 'block text-sm font-medium text-gray-700' },
              ],
              children: [label],
            },
            {
              kind: 'jsx',
              tagName: 'div',
              attributes: [{ name: 'className', value: 'mt-1' }],
              children: [
                {
                  kind: 'jsx',
                  tagName: 'input',
                  selfClosing: true,
                  attributes: [
                    { name: 'type', value: inputType },
                    { name: 'id', value: name },
                    {
                      name: `{...register('${name}'${inputType === 'number' ? ', { valueAsNumber: true }' : ''})}`,
                    },
                    {
                      name: 'className',
                      value:
                        'shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md',
                    },
                  ],
                },
              ],
            },
            {
              kind: 'expression',
              expression: `errors.${name} && <p className="mt-2 text-sm text-red-600">{errors.${name}?.message as string}</p>`,
            },
          ],
        };
      });
  }

  private getHeader(): string {
    return '// GENERATED CODE - DO NOT MODIFY\n// This file was generated by the FormBuilder.';
  }
}
