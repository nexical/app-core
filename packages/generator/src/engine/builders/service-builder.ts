import {
  type ModelDef,
  type FileDefinition,
  type MethodConfig,
  type ClassDefinition,
  type NodeContainer,
} from '../types.js';
import { BaseBuilder } from './base-builder.js';

export class ServiceBuilder extends BaseBuilder {
  constructor(
    private model: ModelDef,
    private enableDelete: boolean = true,
  ) {
    super();
  }

  protected getSchema(node?: NodeContainer): FileDefinition {
    const entityName = this.model.name;
    const serviceName = `${entityName}Service`;
    const lowerEntity = entityName.charAt(0).toLowerCase() + entityName.slice(1);

    const getClass = (n: unknown) =>
      n && typeof n === 'object' && 'getClass' in n
        ? (
            n as unknown as {
              getClass(name: string): {
                getMethod(name: string): { getBodyText(): string } | undefined;
                getStaticMethod(name: string): { getBodyText(): string } | undefined;
              } | null;
            }
          ).getClass(serviceName)
        : null;
    const getExistingStatements = (n: unknown, methodName: string) => {
      const cls = getClass(n);
      const method = cls?.getMethod(methodName) || cls?.getStaticMethod(methodName);
      return method ? [method.getBodyText() || ''] : undefined;
    };

    // Helper to generate standard error block uses Logger
    const errorBlock = (action: string) => `
                        Logger.error("${entityName} ${action} Error", error);
                        return { success: false, error: "${lowerEntity}.service.error.${action}_failed" };
                    `;

    const methods: MethodConfig[] = [
      // LIST
      {
        name: 'list',
        isStatic: true,
        isAsync: true,
        returnType: `Promise<ServiceResponse<${entityName}[]>>`,
        parameters: [
          { name: 'params', type: `Prisma.${entityName}FindManyArgs`, optional: true },
          { name: 'actor', type: 'ApiActor', optional: true },
        ],
        statements: getExistingStatements(node, 'list') || [
          `try {
                        let { where, take, skip, orderBy, select } = params || {};
                        
                        // Allow hooks to modify the query parameters (e.g. for scoping)
                        // Pass actor context if available
                        const filteredParams = await HookSystem.filter('${lowerEntity}.beforeList', { where, take, skip, orderBy, select, actor });
                        where = filteredParams.where;
                        take = filteredParams.take;
                        skip = filteredParams.skip;
                        orderBy = filteredParams.orderBy;
                        select = filteredParams.select;
                        
                        const [data, total] = await db.$transaction([
                            db.${lowerEntity}.findMany({ where, take, skip, orderBy, select }),
                            db.${lowerEntity}.count({ where })
                        ]);
                        
                        const filteredData = await HookSystem.filter('${lowerEntity}.list', data);
                        
                        return { success: true, data: filteredData, total };
                    } catch (error) {
                        ${errorBlock('list')}
                    }`,
        ],
      },
      // GET
      {
        name: 'get',
        isStatic: true,
        isAsync: true,
        returnType: `Promise<ServiceResponse<${entityName} | null>>`,
        parameters: [
          { name: 'id', type: 'string' },
          { name: 'select', type: `Prisma.${entityName}Select`, optional: true },
        ],
        statements: getExistingStatements(node, 'get') || [
          `try {
                        const data = await db.${lowerEntity}.findUnique({ where: { id }, select });
                        if (!data) return { success: false, error: "${lowerEntity}.service.error.not_found" };
                        
                        const filtered = await HookSystem.filter('${lowerEntity}.read', data);
                        
                        return { success: true, data: filtered };
                    } catch (error) {
                        ${errorBlock('get')}
                    }`,
        ],
      },
      // CREATE
      {
        name: 'create',
        isStatic: true,
        isAsync: true,
        returnType: `Promise<ServiceResponse<${entityName}>>`,
        parameters: [
          { name: 'data', type: `Prisma.${entityName}CreateInput` },
          { name: 'select', type: `Prisma.${entityName}Select`, optional: true },
          { name: 'actor', type: 'ApiActor', optional: true },
        ],
        statements: getExistingStatements(node, 'create') || [
          `try {
                        // Pass actor context to hooks for security/authorship validation
                        const input = await HookSystem.filter('${lowerEntity}.beforeCreate', data, { actor });
                        
                        const newItem = await db.$transaction(async (tx) => {
                            const created = await tx.${lowerEntity}.create({ data: input as Prisma.${entityName}CreateInput, select });
                            await HookSystem.dispatch('${lowerEntity}.created', { id: created.id, actorId: actor?.id || 'system'${this.model.fields['teamId'] ? ', teamId: (created as unknown as { teamId: string }).teamId' : ''} });
                            return created;
                        });
                        
                        const filtered = await HookSystem.filter('${lowerEntity}.read', newItem, { actor });
                        
                        return { success: true, data: filtered };
                    } catch (error) {
                        ${errorBlock('create')}
                    }`,
        ],
      },
      // UPDATE
      {
        name: 'update',
        isStatic: true,
        isAsync: true,
        returnType: `Promise<ServiceResponse<${entityName}>>`,
        parameters: [
          { name: 'id', type: 'string' },
          { name: 'data', type: `Prisma.${entityName}UpdateInput` },
          { name: 'select', type: `Prisma.${entityName}Select`, optional: true },
          { name: 'actor', type: 'ApiActor', optional: true },
        ],
        statements: getExistingStatements(node, 'update') || [
          `try {
                        const input = await HookSystem.filter('${lowerEntity}.beforeUpdate', data, { actor, id });
                        
                        const updatedItem = await db.$transaction(async (tx) => {
                            const updated = await tx.${lowerEntity}.update({
                                where: { id },
                                data: input as Prisma.${entityName}UpdateInput,
                                select
                            });
                            await HookSystem.dispatch('${lowerEntity}.updated', { id, changes: Object.keys(input), actorId: actor?.id });
                            return updated;
                        });
                        
                        const filtered = await HookSystem.filter('${lowerEntity}.read', updatedItem, { actor });
                        
                        return { success: true, data: filtered };
                    } catch (error) {
                        ${errorBlock('update')}
                    }`,
        ],
      },
      // DELETE
      ...(this.enableDelete
        ? [
            {
              name: 'delete',
              isStatic: true,
              isAsync: true,
              returnType: `Promise<ServiceResponse<void>>`,
              parameters: [{ name: 'id', type: 'string' }],
              statements: getExistingStatements(node, 'delete') || [
                `try {
                        await db.$transaction(async (tx) => {
                            await tx.${lowerEntity}.delete({ where: { id } });
                            await HookSystem.dispatch('${lowerEntity}.deleted', { id });
                        });
                        return { success: true };
                    } catch (error) {
                        ${errorBlock('delete')}
                    }`,
              ],
            },
          ]
        : [
            {
              name: 'delete',
              isStatic: true,
              isAsync: true,
              returnType: `Promise<ServiceResponse<void>>`,
              parameters: [{ name: 'id', type: 'string' }],
              statements: [
                `return { success: false, error: "${lowerEntity}.service.error.unsafe_delete_blocked" };`,
                `// TODO: This resource has unsafe relations. Use the generated Delete${entityName}Action for manual cleanup.`,
              ],
            },
          ]),
    ];

    const serviceClass: ClassDefinition = {
      name: serviceName,
      isExported: true,
      methods: methods,
      docs: [`Service class for ${entityName}-related business logic.`],
    };

    const imports = [
      { moduleSpecifier: '@/lib/core/db', namedImports: ['db'] },
      { moduleSpecifier: '@/lib/core/logger', namedImports: ['Logger'] },
      { moduleSpecifier: '@/types/service', namedImports: ['ServiceResponse'], isTypeOnly: true },
      { moduleSpecifier: '@/lib/modules/hooks', namedImports: ['HookSystem'] },
      { moduleSpecifier: '@prisma/client', namedImports: [entityName, 'Prisma'], isTypeOnly: true },
      { moduleSpecifier: '@/lib/api/api-docs', namedImports: ['ApiActor'], isTypeOnly: true },
    ];

    return {
      header: '// GENERATED CODE - DO NOT MODIFY',
      imports: imports,
      classes: [serviceClass],
    };
  }
}
