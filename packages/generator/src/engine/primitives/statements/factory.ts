import { type StatementConfig } from "../../types.js";
import { VariableStatementPrimitive } from "./variable.js";
import { ReturnStatementPrimitive } from "./return.js";
import { ExpressionStatementPrimitive } from "./expression.js";
import { JsxElementPrimitive } from "../jsx/element.js";
import { IfStatementPrimitive } from "./if.js";
import { ThrowStatementPrimitive } from "./throw.js";

export class StatementFactory {
    static generate(config: StatementConfig): string {
        if (typeof config === 'string') {
            return config;
        }

        switch (config.kind) {
            case 'variable':
                return new VariableStatementPrimitive(config).generate();
            case 'return':
                return new ReturnStatementPrimitive(config).generate();
            case 'expression':
                return new ExpressionStatementPrimitive(config).generate();
            case 'jsx':
                return new JsxElementPrimitive(config).generate();
            case 'if':
                return new IfStatementPrimitive(config).generate();
            case 'throw':
                return new ThrowStatementPrimitive(config).generate();
            default:
                throw new Error(`Unknown statement kind: ${(config as any).kind}`);
        }
    }

    static generateBlock(configs?: StatementConfig[] | string | string[]): string {
        if (!configs) return '';
        if (typeof configs === 'string') return configs;
        if (Array.isArray(configs)) {
            return configs.map(c => this.generate(c)).join('\n');
        }
        return '';
    }

    // Helper for primitives that need indented blocks (like IF)
    static generateStringBlock(configs: StatementConfig[] | StatementConfig): string {
        const arr = Array.isArray(configs) ? configs : [configs];
        return arr.map(c => this.generate(c)).join('\n');
    }
}
