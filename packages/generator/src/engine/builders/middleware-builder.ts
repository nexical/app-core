import { type ModelDef, type FileDefinition, type ImportConfig, type FunctionConfig } from "../types";
import { BaseBuilder } from "./base-builder";
import { SourceFile, ModuleDeclaration } from "ts-morph";

export class MiddlewareBuilder extends BaseBuilder {
    constructor(
        private models: ModelDef[]
    ) {
        super();
    }

    protected getSchema(node?: SourceFile | ModuleDeclaration): FileDefinition {
        const imports: ImportConfig[] = [
            { moduleSpecifier: "astro", namedImports: ["APIContext", "MiddlewareNext"], isTypeOnly: true },
            { moduleSpecifier: "@/lib/core/db", namedImports: ["db"] },
            { moduleSpecifier: "node:crypto", defaultImport: "crypto" }
        ];

        let authLogic = '';

        for (const model of this.models) {
            if (!model.actor || !model.actor.prefix) continue;

            const { prefix, name } = model.actor;
            const modelName = model.name.charAt(0).toLowerCase() + model.name.slice(1);

            // Logic to check header and look up entity
            const tokenModel = model.actor.fields?.tokenModel || modelName;
            const keyField = model.actor.fields?.keyField || 'hashedKey';

            // If tokenModel is different, we need to find the relation back to the actor
            // If key field involves hashing, hash the token first
            const needsHashing = keyField.includes('hash');
            const tokenValueVar = needsHashing ? 'hashedToken' : 'token';
            const hashLogic = needsHashing ? `
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');` : '';

            let lookupLogic = '';
            if (tokenModel !== modelName) {
                const tokenModelDef = this.models.find(m => m.name === tokenModel);
                let relationField = '';
                if (tokenModelDef) {
                    const relationEntry = Object.entries(tokenModelDef.fields).find(([_, f]) => f.type === model.name);
                    if (relationEntry) {
                        relationField = relationEntry[0];
                    }
                }

                if (!relationField) {
                    relationField = modelName.toLowerCase();
                }

                lookupLogic = `${hashLogic}
            const tokenEntity = await db.${tokenModel.charAt(0).toLowerCase() + tokenModel.slice(1)}.findFirst({
                where: { ${keyField}: ${tokenValueVar} },
                include: { ${relationField}: true }
            });
            
            const entity = tokenEntity?.${relationField};`;
            } else {
                // Direct lookup
                lookupLogic = `${hashLogic}
            const entity = await db.${modelName}.findFirst({
                where: { ${keyField}: ${tokenValueVar} }
            });`;
            }

            const template = `
    if (authHeader?.startsWith("Bearer ${prefix}")) {
        const token = authHeader.substring(7);
        ${lookupLogic}
            
        if (entity) {
            context.locals.actor = { ...entity, type: '${name}' };
            context.locals.actorType = '${name}';
            return next();
        }
    }`;
            authLogic += template;
        }

        // Scan for actor with validStatus or login strategy to implement Bouncer Pattern
        let sessionCheck = `
            // Check if actor was set by previous middleware (e.g. session)
            if (context.locals.actor) return next();`;

        const loginActorModel = this.models.find(m => m.actor?.validStatus || m.actor?.strategy === 'login');



        // If we have a login actor, check for status field
        if (loginActorModel && loginActorModel.fields['status']) {
            const modelName = loginActorModel.name.charAt(0).toLowerCase() + loginActorModel.name.slice(1);

            // Determine check condition: White-list (strict) or Black-list (legacy)
            const validStatus = loginActorModel.actor?.validStatus;
            const statusCheck = validStatus
                ? `!actorCheck || actorCheck.status !== '${validStatus}'`
                : `!actorCheck || actorCheck.status === 'BANNED' || actorCheck.status === 'INACTIVE'`;

            sessionCheck = `
            if (context.locals.actor && context.locals.actorType === '${modelName}') {
                const actorCheck = await db.${modelName}.findUnique({
                    where: { id: context.locals.actor.id },
                    select: { status: true }
                });

                if (${statusCheck}) {
                    context.locals.actor = undefined;
                    return new Response(JSON.stringify({ error: "Session revoked" }), { 
                        status: 403,
                        headers: { "Content-Type": "application/json" }
                    });
                }
                return next();
            }`;
        }

        const onRequest: FunctionConfig = {
            name: "onRequest",
            isAsync: true,
            isExported: true,
            overwriteBody: true,
            parameters: [
                { name: "context", type: "APIContext" },
                { name: "next", type: "MiddlewareNext" }
            ],
            statements: [
                `const authHeader = context.request.headers.get("Authorization");`,
                authLogic,
                `// Dynamic Bouncer Pattern: Validate Actor Status`,
                sessionCheck,
                `return next();`
            ]
        };

        return {
            header: "// GENERATED CODE - DO NOT MODIFY",
            imports,
            functions: [onRequest],
            statements: ["export default { onRequest };"]
        };
    }
}
