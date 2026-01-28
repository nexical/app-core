import { Node, Statement } from "ts-morph";
import { type StatementConfig } from "../../types";

// StatementPrimitive is slightly different from BasePrimitive.
// It might not manage a *single* node forever if we don't have IDs.
// But we want to implement standard create/update logic.

export abstract class StatementPrimitive<TNode extends Statement = Statement, TConfig extends StatementConfig = StatementConfig> {
    constructor(protected config: TConfig) { }

    // Convert config to writer function or structure string
    abstract generate(): string; // For now we might generate text to insert? 
    // Or we use ts-morph specific structures if available (VariableStatementStructure)

    // We can also have an 'apply' method that takes a Block/Body and adds it.
}
