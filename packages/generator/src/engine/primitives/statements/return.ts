import { type ReturnStatementConfig } from "../../types.js";
import { StatementPrimitive } from "./statement-primitive.js";
import { JsxElementPrimitive } from "../jsx/element.js";

export class ReturnStatementPrimitive extends StatementPrimitive<any, ReturnStatementConfig> {
    generate(): string {
        const { expression } = this.config;
        if (typeof expression === 'string') {
            return `return ${expression};`;
        }
        // It is JsxElementConfig
        // We need to generate the JSX string.
        // Importing JsxElementPrimitive here might cause circularity if not careful, 
        // but StatementPrimitive is base, JsxElement extends it.
        // Return extends StatementPrimitive.
        // Siblings. Should be fine.
        return `return ${new JsxElementPrimitive(expression).generate()};`;
    }
}
