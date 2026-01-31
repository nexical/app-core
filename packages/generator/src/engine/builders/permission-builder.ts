import {
  type FileDefinition,
  type ClassDefinition,
  type NodeContainer,
  type ImportConfig,
} from '../types.js';
import { Reconciler } from '../reconciler.js';

export class PermissionBuilder {
  constructor(
    private actionName: string,
    // private context: PermissionContext
  ) {}

  private getSchema(): FileDefinition {
    // Class Name: RegisterUserPermission
    const className = `${this.actionName}Permission`;

    const permissionClass: ClassDefinition = {
      name: className,
      isExported: true,
      methods: [
        {
          name: 'check',
          isAsync: true,
          overwriteBody: false,
          isStatic: true,
          parameters: [
            { name: 'context', type: 'APIContext' },
            { name: 'input', type: 'unknown', optional: true },
          ],
          returnType: 'Promise<void>',
          statements: [
            {
              kind: 'if',
              condition: '!context.locals?.actor && !context.user',
              then: {
                kind: 'throw',
                expression: `new Error("Unauthorized: User must be logged in to access ${this.actionName}")`,
              },
              isDefault: true,
            },
          ],
        },
      ],
    };

    const imports: ImportConfig[] = [
      { moduleSpecifier: 'astro', namedImports: ['APIContext'], isTypeOnly: true },
    ];

    return {
      imports,
      classes: [permissionClass],
    };
  }

  ensure(sourceFile: NodeContainer): void {
    Reconciler.reconcile(sourceFile, this.getSchema());
  }
}
