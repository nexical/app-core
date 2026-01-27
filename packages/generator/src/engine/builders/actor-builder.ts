import { SourceFile } from "ts-morph";
import { type ModelDef, type FileDefinition, type VariableConfig, type ImportConfig } from "../types.js";
import { Reconciler } from "../reconciler.js";
import { BaseBuilder } from "./base-builder.js";

export class ActorBuilder extends BaseBuilder {
    constructor(
        private models: ModelDef[]
    ) {
        super();
    }

    protected getSchema(node?: any): FileDefinition {
        // ... existing logic ...
        const actorsBody: string[] = [];
        const imports: ImportConfig[] = [
            { moduleSpecifier: "@tests/integration/lib/factory", namedImports: ["Factory"] },
            { moduleSpecifier: "@tests/integration/lib/client", isTypeOnly: true, namedImports: ["ApiClient"] }
        ];

        let needsDb = false;
        let needsCrypto = false;

        for (const model of this.models) {
            if (!model.actor) continue;

            // Enable crypto if any actor uses hashing in bearer strategy (heuristic)
            if (model.actor.strategy === 'bearer') {
                 const kf = model.actor.fields?.keyField || 'hashedKey';
                 if (kf.includes('hash')) needsCrypto = true;
            }

            const config = model.actor;
            // e.g. "User" -> "user"
            const actorName = model.name.charAt(0).toLowerCase() + model.name.slice(1);

            let body = '';

            if (config.strategy === 'login') {
                const idField = config.fields?.identifier || 'email';
                const secretField = config.fields?.secret || 'password';

                body = `async (client: ApiClient, params: any = {}) => {
        const password = params.${secretField} || 'Password123!';

        // 1. Get or Create ${model.name}
        let actor;
        if (params.id) {
            actor = await Factory.prisma.${actorName}.findUnique({ where: { id: params.id } });
        } else if (params.${idField}) {
            actor = await Factory.prisma.${actorName}.findUnique({ where: { ${idField}: params.${idField} } });
        }

        if (!actor) {
             const factoryParams = { ...params };
             if (params.password) delete factoryParams.password; // Don't pass raw pass to update if handled
             
            // Factory usually hashes password if provided in defaults, but we ensure it matches the logic
            // The factory builder handles hashing 'Password123!' by default.
            
            actor = await Factory.create('${actorName}', {
                ...factoryParams,
                 // status: params.status || 'ACTIVE' // TODO: Generic status handling?
            });
        }

        // 2. Authenticate
        // Use Session (Login)
        const res = await client.useSession().post('/api/login', {
            email: actor.${idField},
            password: password
        });

        if (res.status >= 400) {
            throw new Error(\`${model.name} actor login failed with status \${res.status}: \${JSON.stringify(res.body)}\`);
        }
        
        return actor;
    }`;
            } else if (config.strategy === 'api-key') {
                const keyModel = config.fields?.keyModel;
                const ownerField = config.fields?.ownerField;

                if (!keyModel || !ownerField) {
                    // Warn or skip
                    continue;
                }

                needsDb = true; // Creating keys usually requires direct DB manipulation to set hashedKey
                needsCrypto = true;

                // Capitalized Key Model for Prisma access
                const keyModelProp = keyModel.charAt(0).toLowerCase() + keyModel.slice(1);

                body = `async (client: ApiClient, params: any = {}) => {
        let actor;
        if (params.id) {
            actor = await Factory.prisma.${actorName}.findUnique({ where: { id: params.id } });
        }

        if (!actor) {
            actor = await Factory.create('${actorName}', params);
        }

        // Create API Key directly
        const randomHex = crypto.randomBytes(32).toString('hex');
        const rawKey = \`ne_test_\${randomHex}\`;
        
        // This assumes simpler hashing or custom logic. For now, matching the Team Example:
        const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

        await db.${keyModelProp}.create({
            data: {
                ${ownerField}: actor.id,
                name: 'Test Key',
                hashedKey: hashedKey,
                prefix: 'ne_test_'
            } as any
        });

        client.useToken(rawKey);

        return actor;
    }`;
            } else if (config.strategy === 'bearer') {
                const tokenModel = config.fields?.tokenModel || model.name;
                const ownerField = config.fields?.ownerField;
                const keyField = config.fields?.keyField || 'hashedKey';
                const prefix = config.prefix || '';

                const tokenModelLocal = tokenModel.charAt(0).toLowerCase() + tokenModel.slice(1);

                // If tokenModel is different from model, we need to find the relation back to the actor
                const isExternalToken = tokenModel !== model.name;
                let relationFieldStr = '';

                if (isExternalToken) {
                    // Find the relation field in tokenModel that points to model.name
                    const targetModelDef = this.models.find(m => m.name === tokenModel);
                    if (targetModelDef) {
                        const relationEntry = Object.entries(targetModelDef.fields).find(([_, f]) => f.type === model.name);
                        if (relationEntry) {
                            const [relationName] = relationEntry;
                            relationFieldStr = `${relationName}: { connect: { id: actor.id } },`;
                        }
                    }
                    // Fallback to ownerField if provided and relation lookup failed (or as scalar override if needed, though scalar + connect is safer via connect)
                    if (!relationFieldStr && ownerField) {
                        // If we only have scalar config, we risk Factory generating the relation.
                        // We assume ownerField is the scalar (e.g. userId). 
                        // But Factory might still generate 'user' relation default.
                        // Prudent approach: Try to guess relation name from ownerField? (userId -> user)
                        const inferred = ownerField.replace('Id', '');

                        // Check if the actor model has the ownerField (e.g. userId)
                        // This allows "Link Table" actors (TeamMember) to act as the User
                        const hasOnActor = model.fields[ownerField];
                        const sourceId = hasOnActor ? `actor.${ownerField}` : `actor.id`;

                        relationFieldStr = `${inferred}: { connect: { id: ${sourceId} } },`;
                    }
                }

                body = `async (client: ApiClient, params: any = {}) => {
        let actor;
        if (params.id) {
            actor = await Factory.prisma.${actorName}.findUnique({ where: { id: params.id } });
        } else if (params.email) {
            // Support email lookup if available
             actor = await Factory.prisma.${actorName}.findFirst({ where: { email: params.email } });
        }

        if (!actor) {
             const factoryParams = { ...params };
             if (params.strategy) delete factoryParams.strategy;
             if (params.password) delete factoryParams.password;
            actor = await Factory.create('${actorName}', factoryParams);
        }

        const rawKey = \`${prefix}\${Date.now()}\`;
        let dbKey = rawKey;
        
        ${keyField.includes('hash') ? `
        // Auto-hash: Field implies hashing, so we hash the raw key at runtime
        dbKey = crypto.createHash('sha256').update(rawKey).digest('hex');
        ` : ''}
        
        // Create Token
        await Factory.create('${tokenModelLocal}', {
            ${relationFieldStr}
            name: 'Test Token',
            ${keyField}: dbKey,
            prefix: '${prefix}'
        });

        client.useToken(rawKey);
        
        return actor;
    }`;
            }

            if (body) {
                actorsBody.push(`${actorName}: ${body}`);
            }
        }

        // If no actors defined, output empty object to valid file
        const actorsVariable: VariableConfig = {
            name: "actors",
            declarationKind: 'const',
            isExported: true,
            initializer: `{
    ${actorsBody.join(',\n    ')}
}`
        };

        if (needsDb) {
            imports.push({ moduleSpecifier: "@/lib/core/db", namedImports: ["db"] });
        }
        if (needsCrypto) {
            imports.push({ moduleSpecifier: "node:crypto", defaultImport: "crypto" });
        }

        return {
            imports: imports,
            variables: [actorsVariable]
        };
    }
}

