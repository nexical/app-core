import { type IfStatementConfig } from "../../types.js";
import { StatementFactory } from "./factory.js";

export class IfStatementPrimitive {
    constructor(private config: IfStatementConfig) { }

    generate(): string {
        const cond = this.config.condition;
        // Recursive generation for blocks
        const thenBlock = StatementFactory.generateStringBlock(this.config.then);
        let result = `if (${cond}) {\n${thenBlock}\n}`;

        if (this.config.else) {
            const elseBlock = StatementFactory.generateStringBlock(this.config.else);
            // Check if it's an "else if" scenario for cleaner code? 
            // For now simple else block.
            if (!Array.isArray(this.config.else) && typeof this.config.else !== 'string' && (this.config.else as any).kind === 'if') {
                // Optimization: else if ... but relying on standard block is safer for now.
                // let's just do standard block.
            }
            result += ` else {\n${elseBlock}\n}`;
        }
        return result;
    }
}
