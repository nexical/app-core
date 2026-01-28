import { SourceFile, Scope } from "ts-morph";
import { type ModelDef, type FileDefinition, type ClassDefinition, type PropertyConfig, type ConstructorConfig } from "../types";
import { Reconciler } from "../reconciler";
import { BaseBuilder } from "./base-builder";

export class SdkIndexBuilder extends BaseBuilder {
    constructor(
        private models: ModelDef[],
        private moduleName: string // e.g. "user-api"
    ) {
        super();
    }

    private toCamelCase(str: string): string {
        return str.charAt(0).toLowerCase() + str.slice(1);
    }

    private toPascalCase(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    private toKebabCase(str: string): string {
        return str.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, '-').toLowerCase();
    }

    protected getSchema(node?: any): FileDefinition {
        const apiModels = this.models.filter(m => m.api && !m.extended);
        const defaultModel = apiModels.find(m => m.default);
        const otherModels = apiModels.filter(m => m.name !== defaultModel?.name);

        const cleanName = this.moduleName.replace(/-api$/, '');
        const mainSdkName = `${this.toPascalCase(cleanName)}SDK`;

        const imports = [
            { moduleSpecifier: "@nexical/sdk-core", namedImports: ["BaseResource", "ApiClient"] },
            ...apiModels.map(m => ({
                moduleSpecifier: `./${this.toKebabCase(m.name)}-sdk`,
                namedImports: [`${m.name}SDK as Base${m.name}SDK`]
            }))
        ];

        const properties = otherModels.map(m => ({
            name: this.toCamelCase(m.name),
            type: `Base${m.name}SDK`,
            scope: Scope.Public
        }));

        const constructorConfig: ConstructorConfig = {
            parameters: [{ name: "client", type: "ApiClient" }],
            statements: [
                `super(client);`,
                ...otherModels.map(m => `this.${this.toCamelCase(m.name)} = new Base${m.name}SDK(client);`)
            ]
        };

        const classExtends = defaultModel ? `Base${defaultModel.name}SDK` : "BaseResource";

        const sdkClass: ClassDefinition = {
            name: mainSdkName,
            isExported: true,
            extends: classExtends,
            properties: properties as any,
            constructorDef: constructorConfig,
            docs: [`Main SDK for the ${this.moduleName} module.`]
        };

        const exports = [
            ...apiModels.map(m => ({
                moduleSpecifier: `./${this.toKebabCase(m.name)}-sdk`,
                exportClause: "*"
            })),
            { moduleSpecifier: "./types", exportClause: "*" }
        ];

        return {
            header: "// GENERATED CODE - DO NOT MODIFY BY HAND",
            imports,
            classes: [sdkClass],
            exports
        };
    }

    ensure(node: SourceFile): void {
        const schema = this.getSchema(node);
        const sdkClass = schema.classes?.[0];

        if (sdkClass) {
            const existing = node.getClass(sdkClass.name);
            if (existing) {
                existing.remove();
            }
        }

        super.ensure(node);
    }
}
