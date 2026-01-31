import {
  type ModelDef,
  type FileDefinition,
  type VariableConfig,
  type ImportConfig,
  type NodeContainer,
} from '../types.js';
import { BaseBuilder } from './base-builder.js';

export class ActorBuilder extends BaseBuilder {
  constructor(private models: ModelDef[]) {
    super();
  }

  public override ensure(node: NodeContainer): void {
    // Fully generated file, clear previous content to avoid duplication
    if ('removeText' in node) (node as unknown as { removeText(): void }).removeText();
    super.ensure(node);
  }

  protected getSchema(node?: NodeContainer): FileDefinition {
    const actorsBody: string[] = [];
    const imports: ImportConfig[] = [
      { moduleSpecifier: '@tests/integration/lib/factory', namedImports: ['Factory'] },
      {
        moduleSpecifier: '@tests/integration/lib/client',
        isTypeOnly: true,
        namedImports: ['ApiClient'],
      },
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

        body = `async (client: ApiClient, params: Record<string, unknown> = {}) => {
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
             if (params.password) delete factoryParams.password; 
             
            actor = await Factory.create('${actorName}', {
                ...factoryParams,
            });
        }

        // 2. Authenticate
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
          continue;
        }

        needsDb = true;
        needsCrypto = true;

        const keyModelProp = keyModel.charAt(0).toLowerCase() + keyModel.slice(1);

        body = `async (client: ApiClient, params: Record<string, unknown> = {}) => {
        let actor;
        if (params.id) {
            actor = await Factory.prisma.${actorName}.findUnique({ where: { id: params.id } });
        }

        if (!actor) {
            actor = await Factory.create('${actorName}', params);
        }

        const randomHex = crypto.randomBytes(32).toString('hex');
        const rawKey = \`ne_test_\${randomHex}\`;
        
        const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

        await db.${keyModelProp}.create({
            data: {
                ${ownerField}: actor.id,
                name: 'Test Key',
                hashedKey: hashedKey,
                prefix: 'ne_test_',
                status: 'ACTIVE'
            } as unknown as object
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

        const isExternalToken = tokenModel !== model.name;
        let relationFieldStr = '';

        if (isExternalToken) {
          const targetModelDef = this.models.find((m) => m.name === tokenModel);
          if (targetModelDef) {
            const relationEntry = Object.entries(targetModelDef.fields).find(
              ([_, f]) => f.type === model.name,
            );
            if (relationEntry) {
              const [relationName] = relationEntry;
              relationFieldStr = `${relationName}: { connect: { id: actor.id } },`;
            }
          }
          if (!relationFieldStr && ownerField) {
            const inferred = ownerField.replace('Id', '');
            const hasOnActor = model.fields[ownerField];
            const sourceId = hasOnActor ? `actor.${ownerField}` : `actor.id`;
            relationFieldStr = `${inferred}: { connect: { id: ${sourceId} } },`;
          }
        }

        body = `async (client: ApiClient, params: Record<string, unknown> = {}) => {
        let actor;
        if (params.id) {
            actor = await Factory.prisma.${actorName}.findUnique({ where: { id: params.id } });
        } else if (params.email) {
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
        
        ${
          keyField.includes('hash')
            ? `
        dbKey = crypto.createHash('sha256').update(rawKey).digest('hex');
        `
            : ''
        }
        
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

    const actorsVariable: VariableConfig = {
      name: 'actors',
      declarationKind: 'const',
      isExported: true,
      initializer: `{
    ${actorsBody.join(',\n    ')}
}`,
    };

    if (needsDb) {
      imports.push({ moduleSpecifier: '@/lib/core/db', namedImports: ['db'] });
    }
    if (needsCrypto) {
      imports.push({ moduleSpecifier: 'node:crypto', defaultImport: 'crypto' });
    }

    return {
      imports: imports,
      variables: [actorsVariable],
    };
  }
}
