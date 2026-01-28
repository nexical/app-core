import { type ExpressionStatementConfig } from "../../types";
import { StatementPrimitive } from "./statement-primitive";

export class ExpressionStatementPrimitive extends StatementPrimitive<any, ExpressionStatementConfig> {
    generate(): string {
        return `${this.config.expression};`;
    }
}
