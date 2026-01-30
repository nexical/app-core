import { SourceFile } from 'ts-morph';
import { type FileDefinition, type ClassDefinition } from '../types.js';
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
            { name: 'context', type: 'any' },
            { name: 'input', type: 'any', optional: true },
          ], // TODO: Proper ApiContext type
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

    return {
      imports: [],
      classes: [permissionClass],
    };
  }

  ensure(sourceFile: SourceFile): void {
    Reconciler.reconcile(sourceFile, this.getSchema());
  }
}
