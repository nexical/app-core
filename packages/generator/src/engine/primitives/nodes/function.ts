import {
  SourceFile,
  FunctionDeclaration,
  type OptionalKind,
  type FunctionDeclarationStructure,
  ModuleDeclaration,
} from 'ts-morph';
import { BasePrimitive } from '../core/base-primitive.js';
import { type FunctionConfig } from '../../types.js';
import { type ValidationResult } from '../contracts.js';
import { StatementFactory } from '../statements/factory.js';
import { Normalizer } from '../../../utils/normalizer.js';

export class FunctionPrimitive extends BasePrimitive<FunctionDeclaration, FunctionConfig> {
  find(parent: SourceFile | ModuleDeclaration) {
    return parent.getFunction(this.config.name);
  }

  create(parent: SourceFile | ModuleDeclaration): FunctionDeclaration {
    return parent.addFunction(this.toStructure());
  }

  update(node: FunctionDeclaration) {
    const structure = this.toStructure();

    if (structure.isAsync !== undefined && node.isAsync() !== structure.isAsync) {
      node.setIsAsync(structure.isAsync);
    }

    if (
      structure.returnType &&
      Normalizer.normalizeType(node.getReturnType().getText()) !==
        Normalizer.normalizeType(structure.returnType as string)
    ) {
      node.setReturnType(structure.returnType as string);
    }

    // Reconcile Parameters
    if (structure.parameters) {
      const existingParams = node.getParameters();
      structure.parameters.forEach((paramStruct, index) => {
        const existingParam = existingParams[index];
        if (existingParam) {
          // Update main properties if they differ
          if (existingParam.getName() !== paramStruct.name) {
            existingParam.rename(paramStruct.name);
          }
          if (
            paramStruct.type &&
            Normalizer.normalizeType(existingParam.getTypeNode()?.getText() || '') !==
              Normalizer.normalizeType(paramStruct.type as string)
          ) {
            existingParam.setType(paramStruct.type as string);
          }
        } else {
          // Add new parameter
          node.addParameter(paramStruct);
        }
      });
      // Ideally we might remove extra parameters, but that's risky.
      // For now, strict index matching for generated code is acceptable.
    }

    if (this.config.overwriteBody && structure.statements) {
      node.setBodyText(structure.statements as string);
    } else {
      this.reconcileBody(node);
    }
  }

  validate(node: FunctionDeclaration): ValidationResult {
    const issues: string[] = [];
    const structure = this.toStructure();

    if (structure.isAsync !== undefined && node.isAsync() !== structure.isAsync) {
      issues.push(
        `Function '${this.config.name}' async modifier mismatch. Expected: ${structure.isAsync}, Found: ${node.isAsync()}`,
      );
    }

    if (
      structure.returnType &&
      Normalizer.normalizeType(node.getReturnType().getText()) !==
        Normalizer.normalizeType(structure.returnType as string)
    ) {
      issues.push(
        `Function '${this.config.name}' return type mismatch. Expected: ${structure.returnType}, Found: ${node.getReturnType().getText()}`,
      );
    }

    return { valid: issues.length === 0, issues };
  }

  private toStructure(): OptionalKind<FunctionDeclarationStructure> {
    return {
      name: this.config.name,
      isExported: this.config.isExported,
      isAsync: this.config.isAsync,
      returnType: this.config.returnType,
      parameters: this.config.parameters?.map((p) => ({
        name: p.name,
        type: p.type,
        hasQuestionToken: p.optional,
      })),
      statements: StatementFactory.generateBlock(this.config.statements),
    };
  }

  private reconcileBody(node: FunctionDeclaration) {
    if (!this.config.statements || this.config.overwriteBody) {
      return; // handled by standard update logic in lines 28-30 or no statements
    }

    // We only reconcile if overwriteBody is FALSE (default)
    // We iterate CONFIG statements and ensure they exist or match

    for (const stmtConfig of this.config.statements) {
      if (typeof stmtConfig === 'string') {
        const normalizedConfig = Normalizer.normalize(stmtConfig);
        const sourceText = Normalizer.normalize(node.getBodyText() || node.getFullText());

        // Check if this specific string statement (or something very close) already exists
        if (sourceText.includes(normalizedConfig)) continue;

        node.addStatements(stmtConfig);
        continue;
      }

      if (stmtConfig && typeof stmtConfig === 'object' && 'getNodes' in stmtConfig) {
        const raw = (stmtConfig as any).raw || '';
        const bodyText = node.getBodyText() || '';
        const normalizedBody = Normalizer.normalize(bodyText);

        if (raw) {
          const normalizedConfig = Normalizer.normalize(raw);
          if (normalizedBody.includes(normalizedConfig)) continue;
        }

        const nodes = stmtConfig.getNodes(node.getProject());
        for (const n of nodes) {
          const text = n.getText();
          const normalizedNode = Normalizer.normalize(text);
          if (!normalizedBody.includes(normalizedNode)) {
            node.addStatements(text);
          }
        }
        if (nodes.length > 0) nodes[0].getSourceFile().delete();
        continue;
      }

      if ((stmtConfig as { isDefault?: boolean }).isDefault === false) {
        // Force overwrite/insert logic here if we wanted to enforce "system" statements
        // For now, let's focus on preserving "default" ones
      }

      if (!('kind' in stmtConfig)) continue;

      if (stmtConfig.kind === 'variable') {
        const varName = stmtConfig.declarations[0]?.name;
        if (!varName) continue;

        const existingVar = node.getVariableStatement((v) =>
          v
            .getDeclarationList()
            .getDeclarations()
            .some((d) => d.getName() === varName),
        );

        if (existingVar) {
          if (stmtConfig.isDefault) {
            // Exists, and is default -> Leave it alone (User might have changed it)
            continue;
          } else {
            // Exists, and NOT default -> Enforce system value
            existingVar.replaceWithText(StatementFactory.generate(stmtConfig));
          }
        } else {
          // Missing -> Insert
          node.addStatements(StatementFactory.generate(stmtConfig));
        }
      } else if (stmtConfig.kind === 'return') {
        // For return, assuming singular main return for now or finding by matching expression?
        // Simple logic: if function has ANY return, and config isDefault, leave it.
        // If not default, overwrite (dangerous if multiple returns).
        // Let's assume singular return for permission checks/simple funcs.
        const existingReturn = node
          .getStatements()
          .find((s) => s.getKindName() === 'ReturnStatement');
        if (existingReturn) {
          if (!stmtConfig.isDefault) {
            existingReturn.replaceWithText(StatementFactory.generate(stmtConfig));
          }
        } else {
          node.addStatements(StatementFactory.generate(stmtConfig));
        }
      } else if (stmtConfig.kind === 'if') {
        // Heuristic: Check if an IF exists with same condition?
        // Or just check if ANY if exists?
        // Let's match by condition text.
        const condition = stmtConfig.condition;
        const existingIf = node
          .getStatements()
          .find((s) => s.getKindName() === 'IfStatement' && s.getText().includes(condition));

        if (existingIf) {
          if (!stmtConfig.isDefault) {
            existingIf.replaceWithText(StatementFactory.generate(stmtConfig));
          }
        } else {
          // Check if we should insert?
          // If it's a default check (e.g. !user), and user removed it, we shouldn't re-add it if isDefault=true?
          // Ah, "isDefault=true" means "Use this content as the default, but let user change it".
          // If user DELETED it, does that count as changing it? Yes.
          // So if we don't find it, we shouldn't add it?
          // BUT, if it's a NEW generation (scaffolding), we want it.
          // If it's RE-generation, and user deleted it, we respect deletion.
          // How to distinguish "Never existed" vs "Deleted"?
          // We can't without history.
          // Standard pattern: "Ensure it exists". If user deleted it, the generator puts it back.
          // ID-based markers solved this ("ID missing? Put it back. ID present? Update.").
          // Without IDs, we default to "Put it back".
          node.addStatements(StatementFactory.generate(stmtConfig));
        }
      } else if (stmtConfig.kind === 'throw') {
        // Similar to IF, match by expression?
        const expr = stmtConfig.expression;
        const existingThrow = node
          .getStatements()
          .find((s) => s.getKindName() === 'ThrowStatement' && s.getText().includes(expr));
        if (existingThrow) {
          if (!stmtConfig.isDefault) {
            existingThrow.replaceWithText(StatementFactory.generate(stmtConfig));
          }
        } else {
          node.addStatements(StatementFactory.generate(stmtConfig));
        }
      }
    }
  }
}
