import { ClassDeclaration, ConstructorDeclaration, Scope, type OptionalKind, type ConstructorDeclarationStructure } from "ts-morph";
import { BasePrimitive } from "../core/base-primitive";
import { type ConstructorConfig } from "../../types";
import { type ValidationResult } from "../contracts";
import { JSDocPrimitive } from "./docs";
import { StatementFactory } from "../statements/factory";
import { Normalizer } from "../../../utils/normalizer";

export class ConstructorPrimitive extends BasePrimitive<ConstructorDeclaration, ConstructorConfig> {

    find(parent: ClassDeclaration) {
        // Classes usually have only one constructor implementation (overloads exist but simplistic approach for now)
        return parent.getConstructors()[0];
    }

    create(parent: ClassDeclaration): ConstructorDeclaration {
        return parent.addConstructor(this.toStructure());
    }

    update(node: ConstructorDeclaration) {
        // Constructor update logic is tricky because replacing parameters can break things.
        // For now, we might just update the body if requested.

        if (this.config.statements) {
            const newBody = StatementFactory.generateBlock(this.config.statements);
            if (Normalizer.normalize(node.getBodyText() || "") !== Normalizer.normalize(newBody)) {
                node.setBodyText(newBody);
            }
        }
    }

    validate(node: ConstructorDeclaration): ValidationResult {
        return { valid: true, issues: [] }; // Basic validation
    }

    private toStructure(): OptionalKind<ConstructorDeclarationStructure> {
        return {
            parameters: this.config.parameters?.map(p => ({
                name: p.name,
                type: p.type,
                scope: p.scope,
                hasQuestionToken: p.optional
            })),
            statements: StatementFactory.generateBlock(this.config.statements)
        };
    }
}
