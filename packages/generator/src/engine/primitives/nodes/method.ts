import {
  ClassDeclaration,
  Scope,
  type MethodDeclarationStructure,
  type OptionalKind,
  MethodDeclaration,
} from 'ts-morph';
import { BasePrimitive } from '../core/base-primitive';
import { DecoratorPrimitive } from './decorator';
import { JSDocPrimitive } from './docs';
import { type ValidationResult } from '../contracts';
import { type MethodConfig } from '../../types';
import { StatementFactory } from '../statements/factory';
import { Normalizer } from '../../../utils/normalizer';

export class MethodPrimitive extends BasePrimitive<MethodDeclaration, MethodConfig> {
  find(parent: ClassDeclaration) {
    // Handle overload matching logic here if you want to be fancy
    return parent.getMethod(this.config.name) || parent.getStaticMethod(this.config.name);
  }

  create(parent: ClassDeclaration): MethodDeclaration {
    return parent.addMethod(this.toStructure());
  }

  update(node: MethodDeclaration) {
    // "Drift Correction" Logic
    const structure = this.toStructure();

    // Enforce Async
    if (structure.isAsync !== node.isAsync()) {
      node.setIsAsync(structure.isAsync!);
    }

    // Enforce Static
    if (structure.isStatic !== node.isStatic()) {
      node.setIsStatic(structure.isStatic!);
    }

    // Enforce Return Type
    if (structure.returnType && node.getReturnType().getText() !== structure.returnType) {
      node.setReturnType(structure.returnType as string);
    }

    // Enforce Parameters (Strict Match)
    const currentParams = node.getParameters();
    const newParams = structure.parameters || [];

    // Simple check: if length differs, or if any param name/type differs -> Rewrite all parameters
    // This is safer than partial updates for parameters to avoid ordering issues.
    let paramsChanged = false;

    if (currentParams.length !== newParams.length) {
      paramsChanged = true;
    } else {
      for (let i = 0; i < currentParams.length; i++) {
        const cur = currentParams[i];
        const neu = newParams[i];
        const neuType = neu.type as string; // We enforce explicit types in generator

        if (cur.getName() !== neu.name) {
          paramsChanged = true;
          break;
        }

        // Type check (ignoring whitespace and delimiters for improved stability)
        const curType = cur.getTypeNode()?.getText() || 'any'; // fallback if implicit
        if (Normalizer.normalizeType(curType) !== Normalizer.normalizeType(neuType)) {
          console.log(
            `[MethodPrimitive] Param mismatch for ${this.config.name}: '${curType}' != '${neuType}'`,
          );
          paramsChanged = true;
          break;
        }

        // Question token check
        if (cur.hasQuestionToken() !== !!neu.hasQuestionToken) {
          paramsChanged = true;
          break;
        }
      }
    }

    if (paramsChanged) {
      // Overwrite parameters
      node.getParameters().forEach((p) => p.remove());
      node.addParameters(newParams);
    }

    // Body Reconciliation
    if (this.config.overwriteBody && structure.statements) {
      node.setBodyText(structure.statements as string);
    } else {
      this.reconcileBody(node);
    }

    // Update Decorators
    this.config.decorators?.forEach((deco) => {
      new DecoratorPrimitive(deco).ensure(node);
    });

    // Handle JSDocs
    if (this.config.docs) {
      const description = this.config.docs.join('\n');
      new JSDocPrimitive({ description }).ensure(node);
    }
  }

  validate(node: MethodDeclaration): ValidationResult {
    // The node is already found and passed in
    const method = node; // Alias for clarity/diff minimization

    const issues: string[] = [];
    const structure = this.toStructure();

    if (structure.isAsync !== undefined && method.isAsync() !== structure.isAsync) {
      issues.push(
        `Method '${this.config.name}' async modifier mismatch. Expected: ${structure.isAsync}, Found: ${method.isAsync()}`,
      );
    }

    if (structure.isStatic !== undefined && method.isStatic() !== structure.isStatic) {
      issues.push(
        `Method '${this.config.name}' static modifier mismatch. Expected: ${structure.isStatic}, Found: ${method.isStatic()}`,
      );
    }

    const returnTypeNode = method.getReturnTypeNode();
    const currentReturnTypeRaw = returnTypeNode?.getText();
    const currentReturnType = currentReturnTypeRaw
      ? Normalizer.normalizeType(currentReturnTypeRaw)
      : undefined;

    if (
      typeof structure.returnType === 'string' &&
      currentReturnType !== Normalizer.normalizeType(structure.returnType)
    ) {
      issues.push(
        `Method '${this.config.name}' return type mismatch. Expected: ${structure.returnType}, Found: ${currentReturnTypeRaw || 'implicit/void'}`,
      );
    }

    // Validate Parameters
    const currentParams = method.getParameters();
    const newParams = structure.parameters || [];

    if (currentParams.length !== newParams.length) {
      issues.push(
        `Method '${this.config.name}' parameter count mismatch. Expected: ${newParams.length}, Found: ${currentParams.length}`,
      );
    } else {
      for (let i = 0; i < currentParams.length; i++) {
        const cur = currentParams[i];
        const neu = newParams[i];
        const neuType = neu.type as string;

        if (cur.getName() !== neu.name) {
          issues.push(
            `Method '${this.config.name}' parameter ${i} name mismatch. Expected: ${neu.name}, Found: ${cur.getName()}`,
          );
        }

        const curTypeRaw = cur.getTypeNode()?.getText() || 'any';
        // Strip import("...") and other qualifiers for basic semantic check
        const curType = Normalizer.normalizeType(curTypeRaw);

        if (curType !== Normalizer.normalizeType(neuType)) {
          issues.push(
            `Method '${this.config.name}' parameter '${neu.name}' type mismatch. Expected: ${neuType}, Found: ${curTypeRaw}`,
          );
        }
      }
    }

    // Validate Decorators
    this.config.decorators?.forEach((deco) => {
      const primitive = new DecoratorPrimitive(deco);
      const decoNode = primitive.find(method);
      if (!decoNode) {
        issues.push(`Decorator '@${deco.name}' is missing on method '${this.config.name}'.`);
      } else {
        const result = primitive.validate(decoNode);
        if (!result.valid) issues.push(...result.issues);
      }
    });

    // Validate JSDocs
    if (this.config.docs) {
      const description = this.config.docs.join('\n');
      const primitive = new JSDocPrimitive({ description });
      const docNode = primitive.find(method);
      if (!docNode) {
        issues.push(`JSDoc is missing on method '${this.config.name}'.`);
      } else {
        const result = primitive.validate(docNode);
        if (!result.valid) issues.push(...result.issues);
      }
    }

    return { valid: issues.length === 0, issues };
  }

  private toStructure(): OptionalKind<MethodDeclarationStructure> {
    return {
      name: this.config.name,
      isStatic: this.config.isStatic,
      isAsync: this.config.isAsync,
      returnType: this.config.returnType,
      parameters: this.config.parameters?.map((p) => ({
        name: p.name,
        type: p.type,
        hasQuestionToken: p.optional,
      })),
      statements: StatementFactory.generateBlock(this.config.statements),
      scope: this.config.scope || Scope.Public,
      decorators: this.config.decorators?.map((d) => ({ name: d.name, arguments: d.arguments })),
      docs: this.config.docs ? [{ description: this.config.docs.join('\n') }] : undefined,
    };
  }

  private reconcileBody(node: MethodDeclaration) {
    if (!this.config.statements || this.config.overwriteBody) {
      return;
    }

    for (const stmtConfig of this.config.statements) {
      if (typeof stmtConfig === 'string') {
        const normalizedConfig = Normalizer.normalize(stmtConfig);
        const sourceText = Normalizer.normalize(node.getBodyText() || '');
        if (sourceText.includes(normalizedConfig)) continue;
        node.addStatements(stmtConfig);
        continue;
      }
      // Logic for other statement types (reused conceptually from FunctionPrimitive)
      // Ideally we extract this to a shared 'StatementReconciler' but for now duplication is safer than major refactor

      if ((stmtConfig as any).isDefault === false) {
        // handle enforced updates
      }

      // Reuse logic if we copy-paste significantly, but for now simple string append is key requirement
    }
  }
}
