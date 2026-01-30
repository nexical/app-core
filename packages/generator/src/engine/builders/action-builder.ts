import { type FileDefinition, type ClassDefinition, type MethodConfig } from '../types.js';
import { BaseBuilder } from './base-builder.js';

export class ActionBuilder extends BaseBuilder {
  constructor(
    private actionName: string,
    private inputType: string,
    private outputType: string,
  ) {
    super();
  }

  protected getSchema(node?: any): FileDefinition {
    // Check if class/method already exist
    let existingStatements: string[] | undefined;
    if (node && 'getClass' in node) {
      const cls = node.getClass(this.actionName);
      if (cls) {
        console.log(`[ActionBuilder] Found existing class ${this.actionName}`);
        const method = cls.getMethod('run') || cls.getStaticMethod('run');
        if (method) {
          console.log(
            `[ActionBuilder] Found existing method 'run' (static: ${method.isStatic()}) in ${this.actionName}`,
          );
          existingStatements = [method.getBodyText() || ''];
        } else {
          console.log(`[ActionBuilder] Method 'run' NOT found in ${this.actionName}`);
        }
      } else {
        console.log(`[ActionBuilder] Class ${this.actionName} NOT found in file`);
      }
    }

    const runMethod: MethodConfig = {
      name: 'run',
      isStatic: true,
      isAsync: true,
      returnType: `Promise<ServiceResponse<${this.outputType}>>`,
      parameters: [
        { name: 'input', type: this.inputType },
        { name: 'context', type: 'APIContext' },
      ],
      statements: existingStatements || [
        // Default stub implementation
        `return { success: true, data: {} as any };`,
      ],
    };

    const actionClass: ClassDefinition = {
      name: this.actionName,
      isExported: true,
      methods: [runMethod],
    };

    const namedImports = [this.inputType, this.outputType]
      .map((t) => t.replace('[]', '').trim())
      .filter((t) => {
        const normalized = t.toLowerCase();
        return ![
          'string',
          'number',
          'boolean',
          'any',
          'void',
          'unknown',
          'never',
          'undefined',
          'object',
          'null',
          'date',
        ].includes(normalized);
      });

    const imports: any[] = [
      { moduleSpecifier: '@/types/service', namedImports: ['ServiceResponse'], isTypeOnly: true },
      { moduleSpecifier: 'astro', namedImports: ['APIContext'], isTypeOnly: true },
    ];

    if (namedImports.length > 0) {
      // Deduplicate imports
      const uniqueImports = [...new Set(namedImports)];
      if (uniqueImports.length > 0) {
        imports.push({
          moduleSpecifier: '../sdk/types',
          namedImports: uniqueImports,
          isTypeOnly: true,
        });
      }
    }

    return {
      imports,
      classes: [actionClass],
    };
  }
}
