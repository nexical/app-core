import { Project, SourceFile } from 'ts-morph';
import { UiBaseBuilder } from './ui-base-builder.js';
import { type FileDefinition, type ModelDef, type ModuleConfig } from '../../types.js';
import { Reconciler } from '../../reconciler.js';
import { toKebabCase, toPascalCase } from '../../../utils/string.js';
import { ZodHelper } from '../utils/zod-helper.js';

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
      if (!model.api) continue;

      const componentName = `${toPascalCase(model.name)}Form`;
      const fileName = `src/components/${componentName}.tsx`;

      const file = project.createSourceFile(fileName, '', { overwrite: true });

      const definition: FileDefinition = {
        header: this.getHeader(),
        imports: [
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
          // Import UI components (Input, Button, etc)
          {
            moduleSpecifier: '@/permissions',
            namedImports: ['Permission'],
          },
          {
            moduleSpecifier: '@/hooks/use-auth',
            namedImports: ['useAuth'],
          },
        ],
        variables: [
          {
            name: componentName,
            isExported: true,
            declarationKind: 'const',
            initializer: this.generateComponent(model, allModels),
          },
        ],
      };

      Reconciler.reconcile(file, definition);
    }
  }

  private generateComponent(model: ModelDef, allModels: ModelDef[]): string {
    const modelName = toPascalCase(model.name);
    // Schema
    const zodSchema = ZodHelper.generateSchema(model, allModels);

    return `({ id, initialData, onSuccess }: { id?: string, initialData?: any, onSuccess?: () => void }) => {
    const isEdit = !!id;
    const createMutation = useCreate${modelName}();
    const updateMutation = useUpdate${modelName}();
    const { user } = useAuth();
    const canCreate = Permission.check('${model.name.toLowerCase()}:create', user?.role || 'ANONYMOUS');
    const canUpdate = Permission.check('${model.name.toLowerCase()}:update', user?.role || 'ANONYMOUS');
    
    // Zod Schema
    const schema = ${zodSchema};
    type FormData = z.infer<typeof schema>;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: initialData || {},
    });

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        }
    }, [initialData, reset]);

    const onSubmit = (data: FormData) => {
        if (isEdit && id) {
            updateMutation.mutate({ id, data }, { onSuccess });
        } else {
            createMutation.mutate(data, { onSuccess });
        }
    };

    // Fields
    // Use simple inputs for now
    
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            ${this.generateFields(model)}
            
            {(isEdit ? canUpdate : canCreate) && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                  {isSubmitting ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
              </button>
            )}
        </form>
    );
}`;
  }

  private generateFields(model: ModelDef): string {
    return Object.entries(model.fields)
      .filter(
        ([name, f]) =>
          !f.private &&
          f.type !== 'Json' &&
          !f.isRelation &&
          !['id', 'createdAt', 'updatedAt'].includes(name),
      )
      .map(([name, f]) => {
        const label = toPascalCase(name)
          .replace(/([A-Z])/g, ' $1')
          .trim();
        let inputType = 'text';
        if (f.type === 'Int' || f.type === 'Float') inputType = 'number';
        if (f.type === 'Boolean') inputType = 'checkbox';
        if (f.type === 'DateTime') inputType = 'datetime-local';

        // checkbox handling is slightly different in layouts, keeping simple for now
        if (inputType === 'checkbox') {
          return `
            <div className="flex items-start">
                <div className="flex items-center h-5">
                    <input
                        id="${name}"
                        type="checkbox"
                        {...register('${name}')}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="${name}" className="font-medium text-gray-700">${label}</label>
                </div>
            </div>`;
        }

        return `
            <div>
                <label htmlFor="${name}" className="block text-sm font-medium text-gray-700">${label}</label>
                <div className="mt-1">
                    <input
                        type="${inputType}"
                        id="${name}"
                        {...register('${name}'${inputType === 'number' ? ', { valueAsNumber: true }' : ''})}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                </div>
                {errors.${name} && <p className="mt-2 text-sm text-red-600">{errors.${name}?.message as string}</p>}
            </div>`;
      })
      .join('\n            ');
  }

  private getHeader(): string {
    return '// GENERATED CODE - DO NOT MODIFY\n// This file was generated by the FormBuilder.';
  }
}
