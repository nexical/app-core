import { Node, JSDoc, JSDocableNode, type OptionalKind, type JSDocStructure } from "ts-morph";
import { BasePrimitive } from "../core/base-primitive";
import { type ValidationResult } from "../contracts";

interface JSDocConfig {
    description: string;
}

// We treat 'docs' as a list of strings in the config, each string is a description for a JSDoc block.
// So config here is tricky. BasePrimitive expects TConfig.
// But we might pass just the string? 
// Let's say config is { description: string }.

export class JSDocPrimitive extends BasePrimitive<JSDoc, JSDocConfig> {

    // Note: getJsDocs returns an array. "find" typically returns ONE node.
    // If a node has multiple docs, which one do we manage?
    // We assume 1:1 mapping based on content is hard.
    // Strategy: We expect the node to have 1 JSDoc block matching the description?
    // Or we manage the FIRST block?
    // Usually code has one JSDoc block.
    // Let's manage the "main" JSDoc.
    // Ideally we match by 'some content' or position.
    // For simplicity: We manage the *first* JSDoc block if multiple? 
    // Or we say this primitive manages "The JSDoc". 

    // Simplest approach: We strictly enforce that the node has JSDocs matching the config list order.
    // But BasePrimitive 'find' returns one node.
    // So JSDocPrimitive should manage ONE JSDoc block.

    find(parent: Node): JSDoc | undefined {
        if (!Node.isJSDocable(parent)) return undefined; // or use type guard
        // ts-morph Node mixins are tricky. 
        // Simplest: check if method exists or cast.
        const docs = (parent as any).getJsDocs?.();

        if (docs && docs.length > 0) {
            return docs[0];
        }
        return undefined;
    }

    create(parent: Node): JSDoc {
        // Assume parent is correct for now or cast
        // addJsDoc is on JSDocableNode.
        return (parent as any).addJsDoc(this.toStructure());
    }

    update(node: JSDoc) {
        const structure = this.toStructure();

        // Check description drift
        const currentDesc = node.getDescription().trim();
        const newDesc = (structure.description as string || '').trim();

        if (currentDesc !== newDesc) {
            node.setDescription(newDesc);
        }
    }

    validate(node: JSDoc): ValidationResult {
        const issues: string[] = [];
        const structure = this.toStructure();

        const currentDesc = node.getDescription().trim();
        const newDesc = (structure.description as string || '').trim();

        if (currentDesc !== newDesc) {
            issues.push(`JSDoc description mismatch. Expected: "${newDesc}", Found: "${currentDesc}"`);
        }

        return { valid: issues.length === 0, issues };
    }

    private toStructure(): OptionalKind<JSDocStructure> {
        return {
            description: this.config.description
        };
    }
}
