import {
  type FileDefinition,
  type ClassDefinition,
  type MethodConfig,
  type ImportConfig,
  type NodeContainer,
  type StatementConfig,
  type ParsedStatement,
} from '../types.js';
import { BaseBuilder } from './base-builder.js';
import { TemplateLoader } from '../../utils/template-loader.js';
import { ts } from '../primitives/statements/factory.js';

export class ActionBuilder extends BaseBuilder {
  constructor(
    private actionName: string,
    private inputType: string,
    private outputType: string,
  ) {
    super();
  }

  protected getSchema(node?: NodeContainer): FileDefinition {
    const capturedReturnType = `Promise<ServiceResponse<${this.outputType}>>`;
    let existingStatements: StatementConfig[] | undefined;

    if (node && 'getClass' in node) {
      const cls = node.getClass(this.actionName);
      if (cls) {
        console.info(`[ActionBuilder] Found existing class ${this.actionName}`);
        const method = cls.getMethod('run') || cls.getStaticMethod('run');
        if (method) {
          console.info(
            `[ActionBuilder] Found existing method 'run' (static: ${method.isStatic()}) in ${this.actionName}`,
          );
          const body = method.getBodyText();
          if (body) {
            existingStatements = [ts`${body}`];
          }
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
      returnType: capturedReturnType,
      parameters: [
        { name: this.inputType === 'void' ? '_input' : 'input', type: this.inputType },
        { name: 'context', type: 'APIContext' },
      ],
      statements: existingStatements || [
        TemplateLoader.load('action/run.tsf', { outputType: this.outputType }),
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

    const hasOrchestrationService = existingStatements?.some((s) => {
      const text = 'raw' in s ? (s as ParsedStatement).raw : '';
      return text.includes('OrchestrationService');
    });

    if (hasOrchestrationService) {
      imports.push({
        moduleSpecifier: '../services/orchestration-service',
        namedImports: ['OrchestrationService'],
      });
    }

    const hasZod = existingStatements?.some((s) => {
      const text = 'raw' in s ? (s as ParsedStatement).raw : '';
      return text.includes('z.');
    });

    if (hasZod) {
      imports.push({
        moduleSpecifier: 'zod',
        namedImports: ['z'],
      });
    }

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
      header: '// GENERATED CODE - DO NOT MODIFY',
      imports,
      classes: [actionClass],
    };
  }
}
