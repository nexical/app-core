import { type ExpressionStatementConfig } from "../../types.js";
import { StatementPrimitive } from "./statement-primitive.js";

export class ExpressionStatementPrimitive extends StatementPrimitive<any, ExpressionStatementConfig> {
    generate(): string {
        return `${this.config.expression};`;
    }
}
