import { SourceFile, ModuleDeclaration, ModuleDeclarationKind, type OptionalKind, type ModuleDeclarationStructure } from "ts-morph";
import { BasePrimitive } from "../core/base-primitive.js";
import { type ModuleConfig } from "../../types.js";
import { type ValidationResult } from "../contracts.js";
import { Reconciler } from "../../reconciler.js";

// We need a common interface for SourceFile and ModuleDeclaration as they both hold statements
// but they don't share a simple common interface in ts-morph export that exposes addClass etc easily without casting
// However 'any' works for Reconciler.reconcile if we inspect it or change Reconciler signature.
// Let's assume Reconciler.reconcile will be updated to accept any "StatementedNode"

export class ModulePrimitive extends BasePrimitive<ModuleDeclaration, ModuleConfig> {

    find(parent: SourceFile | ModuleDeclaration) {
        return parent.getModule(this.config.name);
    }

    create(parent: SourceFile | ModuleDeclaration): ModuleDeclaration {
        return parent.addModule(this.toStructure());
    }

    update(node: ModuleDeclaration) {
        if (this.config.isExported !== undefined && node.isExported() !== this.config.isExported) {
            node.setIsExported(this.config.isExported);
        }

        // Recursively reconcile contents
        // This requires Reconciler to accept ModuleDeclaration
        Reconciler.reconcile(node, this.config as any);
    }

    ensure(parent: SourceFile | ModuleDeclaration): ModuleDeclaration {
        let node = this.find(parent);
        if (!node) {
            node = this.create(parent);
        }
        this.update(node);
        return node;
    }

    validate(node: ModuleDeclaration): ValidationResult {
        const result = Reconciler.validate(node as any, this.config as any);
        return result;
    }

    private toStructure(): OptionalKind<ModuleDeclarationStructure> {
        let kind = ModuleDeclarationKind.Namespace;
        let hasDeclareKeyword = false;

        if (this.config.name === 'global') {
            kind = ModuleDeclarationKind.Global;
            hasDeclareKeyword = true;
        } else if (this.config.isDeclaration) {
            // Kind of ambiguous what 'isDeclaration' maps to for 'module'
            // Usually 'declare module "foo"' -> Module
            // 'namespace Foo' -> Namespace
            // For now, if name is quoted string, it's a Module.
            if (this.config.name.includes('"') || this.config.name.includes("'")) {
                kind = ModuleDeclarationKind.Module;
                hasDeclareKeyword = true; // explicitly declare module "foo"
            }
        }

        return {
            name: this.config.name,
            isExported: this.config.isExported,
            declarationKind: kind,
            hasDeclareKeyword: hasDeclareKeyword,
            // We don't generate body here because we reconcile it recursively
            statements: []
        };
    }
}
