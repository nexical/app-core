import { type ReturnStatementConfig } from "../../types";
import { StatementPrimitive } from "./statement-primitive";
import { JsxElementPrimitive } from "../jsx/element";

export class ReturnStatementPrimitive extends StatementPrimitive<any, ReturnStatementConfig> {
    generate(): string {
        const { expression } = this.config;
        if (!expression) {
            return 'return;';
        }
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
