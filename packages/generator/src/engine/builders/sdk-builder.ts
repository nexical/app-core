import { SourceFile } from "ts-morph";
import { type ModelDef, type FileDefinition, type ClassDefinition, type MethodConfig, type CustomRoute, type ImportConfig } from "../types.js";
import { Reconciler } from "../reconciler.js";
import { BaseBuilder } from "./base-builder.js";

export class SdkBuilder extends BaseBuilder {
    constructor(private model: ModelDef, private customRoutes: CustomRoute[] = []) {
        super();
    }

    private getRole(action: string): string {
        const roleConfig = this.model.role;
        if (!roleConfig) return 'member';
        if (typeof roleConfig === 'string') return roleConfig;
        return roleConfig[action] || 'member';
    }

    protected getSchema(node?: any): FileDefinition {
        const entityName = this.model.name;
        const sdkName = `${entityName}SDK`;
        const kebabEntity = entityName.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, '-').toLowerCase();
        const endpoint = kebabEntity; // e.g. "user-api"

        const methods: MethodConfig[] = [];

        // Add standard CRUD only if DB model
        if (this.model.db !== false) {
            // LIST
            if (this.getRole('list') !== 'none') {
                methods.push({
                    name: "list",
                    isAsync: true,
                    isStatic: false,
                    returnType: `Promise<{ success: boolean; data: ${entityName}[]; error?: string; meta: { total: number } }>`,
                    parameters: [{ name: "params", type: "{ search?: string; take?: number; skip?: number; orderBy?: string | Record<string, \"asc\" | \"desc\">; filters?: Record<string, any> }", optional: true }],
                    statements: [
                        `let orderBy = params?.orderBy;`,
                        `if (orderBy && typeof orderBy === 'object') {`,
                        `    const keys = Object.keys(orderBy);`,
                        `    if (keys.length > 0) {`,
                        `        orderBy = \`\${keys[0]}:\${orderBy[keys[0]]}\`;`,
                        `    }`,
                        `}`,
                        `const query = this.buildQuery({ ...params?.filters, search: params?.search, take: params?.take, skip: params?.skip, orderBy });`,
                        `return this._request('GET', \`/${endpoint}\${query}\`);`
                    ],
                    overwriteBody: true
                });
            }

            // GET
            if (this.getRole('get') !== 'none') {
                methods.push({
                    name: "get",
                    isAsync: true,
                    isStatic: false,
                    returnType: `Promise<{ success: boolean; data: ${entityName}; error?: string }>`,
                    parameters: [{ name: "id", type: "string" }],
                    statements: [
                        `return this._request('GET', \`/${endpoint}/\${id}\`);`
                    ],
                    overwriteBody: true
                });
            }

            // CREATE
            if (this.getRole('create') !== 'none') {
                methods.push({
                    name: "create",
                    isAsync: true,
                    isStatic: false,
                    returnType: `Promise<{ success: boolean; data: ${entityName}; error?: string }>`,
                    parameters: [{ name: "data", type: `Partial<${entityName}>` }],
                    statements: [
                        `return this._request('POST', \`/${endpoint}\`, data);`
                    ],
                    overwriteBody: true
                });
            }

            // UPDATE
            if (this.getRole('update') !== 'none') {
                methods.push({
                    name: "update",
                    isAsync: true,
                    isStatic: false,
                    returnType: `Promise<{ success: boolean; data: ${entityName}; error?: string }>`,
                    parameters: [
                        { name: "id", type: "string" },
                        { name: "data", type: `Partial<${entityName}>` }
                    ],
                    statements: [
                        `return this._request('PUT', \`/${endpoint}/\${id}\`, data);`
                    ],
                    overwriteBody: true
                });
            }

            // DELETE
            if (this.getRole('delete') !== 'none') {
                methods.push({
                    name: "delete",
                    isAsync: true,
                    isStatic: false,
                    returnType: `Promise<{ success: boolean; error?: string }>`,
                    parameters: [{ name: "id", type: "string" }],
                    statements: [
                        `return this._request('DELETE', \`/${endpoint}/\${id}\`);`
                    ],
                    overwriteBody: true
                });
            }
        }

        // Add Custom Routes
        for (const route of this.customRoutes) {
            const pathParams = route.path.match(/\[(\w+)\]/g)?.map(p => p.slice(1, -1)) || [];

            const methodConfig: MethodConfig = {
                name: route.method,
                isAsync: true,
                isStatic: false,
                returnType: `Promise<{ success: boolean; data: ${route.output || 'any'}; error?: string }>`,
                parameters: pathParams.map(p => ({ name: p, type: "string" })),
                statements: []
            };

            let url = route.path.startsWith('/') ? route.path : `/${route.path}`;
            // Replace [param] with ${param} for template literal
            url = url.replace(/\[(\w+)\]/g, '${$1}');

            if (['POST', 'PUT', 'PATCH'].includes(route.verb)) {
                const inputType = route.input || 'any';
                methodConfig.parameters!.push({ name: "data", type: inputType });
                methodConfig.statements!.push(`return this._request('${route.verb}', \`/${endpoint}${url}\`, data);`);
            } else {
                methodConfig.statements!.push(`return this._request('${route.verb}', \`/${endpoint}${url}\`);`);
            }
            methodConfig.overwriteBody = true; // Force update to ensure sync

            methods.push(methodConfig);
        }

        const sdkClass: ClassDefinition = {
            name: sdkName,
            isExported: true,
            extends: "BaseResource",
            methods: methods,
            docs: [`SDK client for ${entityName}.`]
        };

        const imports: ImportConfig[] = [
            { moduleSpecifier: "@nexical/sdk-core", namedImports: ["BaseResource", "ApiClient"] },
        ];

        // Entity Type (Always from ./types.ts which re-exports/defines everything)
        // Skip if virtual model with no fields (e.g. Auth grouping)
        const namedImports: string[] = [];
        if (Object.keys(this.model.fields).length > 0 || this.model.db !== false) {
            namedImports.push(entityName);
        }

        // Collect other types from custom routes
        const otherTypes = new Set<string>();
        for (const route of this.customRoutes) {
            if (route.input && route.input !== 'any' && route.input !== entityName) otherTypes.add(route.input.replace('[]', ''));
            if (route.output && route.output !== 'any' && route.output !== entityName) otherTypes.add(route.output.replace('[]', ''));
        }

        if (namedImports.length > 0 || otherTypes.size > 0) {
            imports.push({
                moduleSpecifier: "./types",
                namedImports: [...namedImports, ...Array.from(otherTypes)],
                isTypeOnly: true
            });
        }

        return {
            header: "// GENERATED CODE - DO NOT MODIFY BY HAND",
            imports: imports,
            classes: [sdkClass]
        };
    }
}

