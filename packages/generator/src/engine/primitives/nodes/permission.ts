import { SourceFile } from 'ts-morph';
import { PermissionMap } from '../../types.js';
import { VariablePrimitive } from './variable.js';
import { TypePrimitive } from './type.js';
import { ClassPrimitive } from './class.js';
import { MethodPrimitive } from './method.js';
import { ValidationResult } from '../../primitives/contracts.js';

export class PermissionPrimitive {
  constructor(private permissions: PermissionMap) {}

  ensure(sourceFile: SourceFile): void {
    // 1. Generate Permission Registry Variable
    // export const PermissionRegistry = { ... } as const;
    const initializer = JSON.stringify(this.permissions, null, 2);

    new VariablePrimitive({
      name: 'PermissionRegistry',
      declarationKind: 'const',
      isExported: true,
      initializer: `${initializer} as const`,
    }).ensure(sourceFile);

    // 2. Generate Permission Type
    // export type PermissionAction = keyof typeof PermissionRegistry;
    new TypePrimitive({
      name: 'PermissionAction',
      isExported: true,
      type: 'keyof typeof PermissionRegistry',
    }).ensure(sourceFile);

    // 3. Generate Permission Class with static check
    const classPrimitive = new ClassPrimitive({
      name: 'Permission',
      isExported: true,
    });
    const classNode = classPrimitive.ensure(sourceFile);

    new MethodPrimitive({
      name: 'check',
      isStatic: true,
      isAsync: false,
      parameters: [
        { name: 'action', type: 'PermissionAction' },
        { name: 'role', type: 'string' },
      ],
      returnType: 'boolean',
      statements: [
        {
          kind: 'variable',
          declarationKind: 'const',
          declarations: [
            {
              name: 'allowedRoles',
              initializer: '(PermissionRegistry as any)[action] as readonly string[]',
            },
          ],
        },
        {
          kind: 'return',
          expression: 'allowedRoles.includes(role)',
        },
      ],
    }).ensure(classNode);
  }

  find(sourceFile: SourceFile) {
    return sourceFile.getVariableDeclaration('PermissionRegistry');
  }

  validate(node: any): ValidationResult {
    return { valid: true, issues: [] };
  }
}
