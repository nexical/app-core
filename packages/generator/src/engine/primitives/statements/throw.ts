import { type ThrowStatementConfig } from "../../types";

export class ThrowStatementPrimitive {
    constructor(private config: ThrowStatementConfig) { }

    generate(): string {
        return `throw ${this.config.expression};`;
    }
}
