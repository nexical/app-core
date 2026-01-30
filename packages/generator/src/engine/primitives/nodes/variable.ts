import {
  SourceFile,
  VariableStatement,
  VariableDeclarationKind,
  ModuleDeclaration,
} from 'ts-morph';
import { BasePrimitive } from '../core/base-primitive';
import { type VariableConfig } from '../../types';
import { type ValidationResult } from '../contracts';

export class VariablePrimitive extends BasePrimitive<VariableStatement, VariableConfig> {
  find(parent: SourceFile | ModuleDeclaration) {
    // ts-morph doesn't have a direct getVariableStatement(name) that works simply like classes
    // We need to find the statement that contains the declaration with the name
    return parent.getVariableStatement((node) => {
      return node.getDeclarations().some((d) => d.getName() === this.config.name);
    });
  }

  create(parent: SourceFile | ModuleDeclaration): VariableStatement {
    return parent.addVariableStatement({
      declarationKind: this.getDeclarationKind(this.config.declarationKind),
      isExported: this.config.isExported,
      declarations: [
        {
          name: this.config.name,
          type: this.config.type,
          initializer: this.config.initializer,
        },
      ],
    });
  }

  update(node: VariableStatement) {
    const decl = node.getDeclarations().find((d) => d.getName() === this.config.name);
    if (!decl) return; // Should not happen if find() works

    if (this.config.isExported !== undefined && node.isExported() !== this.config.isExported) {
      node.setIsExported(this.config.isExported);
    }

    const kind = this.getDeclarationKind(this.config.declarationKind);
    if (node.getDeclarationKind() !== kind) {
      node.setDeclarationKind(kind);
    }

    if (this.config.type && decl.getType().getText() !== this.config.type) {
      decl.setType(this.config.type);
    }

    if (this.config.initializer && decl.getInitializer()?.getText() !== this.config.initializer) {
      decl.setInitializer(this.config.initializer);
    }
  }

  validate(node: VariableStatement): ValidationResult {
    const issues: string[] = [];
    const decl = node.getDeclarations().find((d) => d.getName() === this.config.name);

    if (!decl) {
      return {
        valid: false,
        issues: [`Variable declaration '${this.config.name}' not found within statement.`],
      };
    }

    if (this.config.isExported !== undefined && node.isExported() !== this.config.isExported) {
      issues.push(`Variable '${this.config.name}' export mismatch.`);
    }

    if (this.config.initializer && decl.getInitializer()?.getText() !== this.config.initializer) {
      issues.push(
        `Variable '${this.config.name}' initializer mismatch. Expected: ${this.config.initializer}, Found: ${decl.getInitializer()?.getText()}`,
      );
    }

    // Additional validations can be added

    return { valid: issues.length === 0, issues };
  }

  private getDeclarationKind(kind?: 'const' | 'let' | 'var'): VariableDeclarationKind {
    switch (kind) {
      case 'let':
        return VariableDeclarationKind.Let;
      case 'var':
        return VariableDeclarationKind.Var;
      default:
        return VariableDeclarationKind.Const;
    }
  }
}
