import type { MethodConfig, VariableStatementConfig, ReturnStatementConfig } from "../types.js";

export class CrudPatterns {
    static createMethod(modelName: string): MethodConfig {
        return {
            name: 'create',
            isAsync: true,
            parameters: [
                { name: 'data', type: `Create${modelName}Input` }
            ],
            returnType: `Promise<${modelName}>`,
            statements: [
                {
                    kind: 'variable',
                    declarationKind: 'const',
                    declarations: [{
                        name: 'result',
                        initializer: `await db.${modelName.toLowerCase()}.create({ data })`
                    }]
                } as VariableStatementConfig,
                {
                    kind: 'return',
                    expression: 'result'
                } as ReturnStatementConfig
            ]
        };
    }

    static findMethod(modelName: string): MethodConfig {
        return {
            name: 'findById',
            isAsync: true,
            parameters: [
                { name: 'id', type: 'string' }
            ],
            returnType: `Promise<${modelName} | null>`,
            statements: [
                {
                    kind: 'return',
                    expression: `await db.${modelName.toLowerCase()}.findUnique({ where: { id } })`
                } as ReturnStatementConfig
            ]
        };
    }
}
