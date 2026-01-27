import { type VariableStatementConfig } from "../../types.js";
import { StatementPrimitive } from "./statement-primitive.js";

export class VariableStatementPrimitive extends StatementPrimitive<any, VariableStatementConfig> {
    generate(): string {
        // e.g. "const name: Type = init;"
        const parts: string[] = [];
        // Kind
        parts.push(this.config.declarationKind);

        const declarations = this.config.declarations.map(d => {
            let decl = d.name;
            if (d.type) {
                decl += `: ${d.type}`;
            }
            if (d.initializer) {
                decl += ` = ${d.initializer}`;
            }
            return decl;
        });

        parts.push(declarations.join(', '));
        return parts.join(' ') + ';';
    }
}
