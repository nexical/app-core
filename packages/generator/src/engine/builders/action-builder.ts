import {
  type FileDefinition,
  type ClassDefinition,
  type MethodConfig,
  type ImportConfig,
  type NodeContainer,
} from '../types.js';
import { BaseBuilder } from './base-builder.js';

export class ActionBuilder extends BaseBuilder {
  constructor(
    private actionName: string,
    private inputType: string,
    private outputType: string,
  ) {
    super();
  }

  protected getSchema(node?: NodeContainer): FileDefinition {
    // Check if class/method already exist
    let existingStatements: string[] | undefined;
    if (node && 'getClass' in node) {
      const cls = node.getClass(this.actionName);
      if (cls) {
        console.info(`[ActionBuilder] Found existing class ${this.actionName}`);
        const method = cls.getMethod('run') || cls.getStaticMethod('run');
        if (method) {
          console.info(
            `[ActionBuilder] Found existing method 'run' (static: ${method.isStatic()}) in ${this.actionName}`,
          );
          existingStatements = [method.getBodyText() || ''];
        } else {
          console.info(`[ActionBuilder] Method 'run' NOT found in ${this.actionName}`);
        }
      } else {
        console.info(`[ActionBuilder] Class ${this.actionName} NOT found in file`);
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
        `return { success: true, data: {} as unknown as ${this.outputType} };`,
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

    const imports: ImportConfig[] = [
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
