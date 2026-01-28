import { SourceFile } from "ts-morph";
import { type ModelDef, type FileDefinition, type VariableConfig, type TestRoleConfig } from "../types";
import { Reconciler } from "../reconciler";
import { BaseBuilder } from "./base-builder";

type TestOperation = 'create' | 'list' | 'get' | 'update' | 'delete';

export class TestBuilder extends BaseBuilder {
    constructor(
        private model: ModelDef,
        private moduleName: string,
        private operation: TestOperation,
        private roleConfig: TestRoleConfig = {}
    ) {
        super();
    }

    private getRole(operation: string): string {
        if (!this.model.role) return 'member';
        if (typeof this.model.role === 'string') return this.model.role;
        return (this.model.role as any)[operation] || 'member';
    }

    private getTestActorModelName(): string {
        const actor = (this.model as any).test?.actor;
        if (!actor) {
            throw new Error(`Model [${this.model.name}] is missing required 'test.actor' configuration. No default actor is provided.`);
        }
        return actor;
    }

    private getActorRelationSnippet(): string {
        const actorName = this.getTestActorModelName();
        // Skip self-referential links (e.g. Team acting on Team)
        if (this.model.name.toLowerCase() === actorName.toLowerCase()) {
            return '';
        }

        for (const [name, field] of Object.entries(this.model.fields)) {
            // Check if field type matches actor name (case insensitive)
            if (field.type && field.type.toLowerCase() === actorName.toLowerCase()) {
                return `, ${name}: { connect: { id: actor.id } }`;
            }
        }

        // Loose coupling: check for actorId or userId
        if (this.model.fields['actorId']) return `, actorId: actor.id`;
        if (this.model.fields['userId'] && actorName.toLowerCase() === 'user') return `, userId: actor.id`;

        return '';
    }

    private getActorStatement(operation: TestOperation): string {
        const requiredRole = this.getRole(operation);
        const actorName = this.getTestActorModelName();

        if (requiredRole === 'public') {
            return '// Public access - no auth required';
        }

        // Check config first
        if (this.roleConfig[requiredRole]) {
            const opts = JSON.stringify(this.roleConfig[requiredRole]).replace(/"([^"]+)":/g, '$1:').replace(/"/g, "'");
            return `const actor = await client.as('${actorName}', ${opts});`;
        }

        // Fallback
        return `const actor = await client.as('${actorName}', {});`;
    }

    private getNegativeActorStatement(operation: TestOperation): string {
        return `(client as any).bearerToken = 'invalid-token';
            const actor = undefined as any;`;
    }

    private getUniqueField(): string | null {
        // Priority: email > username > any unique string field
        if (this.model.fields['email']) return 'email';
        if (this.model.fields['username']) return 'username';

        for (const [name, field] of Object.entries(this.model.fields)) {
            if (field.type === 'String' && field.attributes?.some(a => a.includes('@unique'))) {
                return name;
            }
        }
        return null;
    }

    private isForeignKey(fieldName: string): boolean {
        for (const otherField of Object.values(this.model.fields)) {
            if (otherField.isRelation && otherField.attributes) {
                const relationAttr = otherField.attributes.find(a => a.startsWith('@relation'));
                if (relationAttr) {
                    const match = relationAttr.match(/fields:\s*\[([^\]]+)\]/);
                    if (match) {
                        const fields = match[1].split(',').map(f => f.trim());
                        if (fields.includes(fieldName)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    protected getSchema(node?: any): FileDefinition {
        // ... existing logic ...
        const entityName = this.model.name;
        // e.g. "UserApi" -> "userApi" for camelCase variable names
        const camelEntity = entityName.charAt(0).toLowerCase() + entityName.slice(1);
        // e.g. "UserApi" -> "user-api" for URLs
        const kebabEntity = entityName.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, '-').toLowerCase();

        // Generate mock data based on fields
        const mockData = this.generateMockData();
        const updateData = this.generateUpdateData();

        let testBody = '';

        switch (this.operation) {
            case 'create':
                testBody = this.generateCreateTests(kebabEntity, camelEntity, mockData);
                break;
            case 'list':
                testBody = this.generateListTests(kebabEntity, camelEntity, mockData);
                break;
            case 'get':
                testBody = this.generateGetTests(kebabEntity, camelEntity, mockData);
                break;
            case 'update':
                testBody = this.generateUpdateTests(kebabEntity, camelEntity, mockData, updateData);
                break;
            case 'delete':
                testBody = this.generateDeleteTests(kebabEntity, camelEntity, mockData);
                break;
        }

        const testSuite: VariableConfig = {
            name: "_test",
            declarationKind: 'const',
            isExported: false,
            initializer: `describe('${entityName} API - ${this.operation.charAt(0).toUpperCase() + this.operation.slice(1)}', () => {
    let client: ApiClient;

    beforeEach(async () => {
        client = new ApiClient(TestServer.getUrl());
    });

    ${testBody}
})`
        };

        return {
            header: "// GENERATED CODE - DO NOT MODIFY",
            imports: [
                { moduleSpecifier: "vitest", namedImports: ["describe", "it", "expect", "beforeEach"] },
                { moduleSpecifier: "@tests/integration/lib/client", namedImports: ["ApiClient"] },
                { moduleSpecifier: "@tests/integration/lib/factory", namedImports: ["Factory"] },
                { moduleSpecifier: "@tests/integration/lib/server", namedImports: ["TestServer"] }
            ],
            variables: [testSuite]
        };
    }

    private getActorRelationFieldName(): string | null {
        // Case 1: ID link (e.g. userId) - Look for standard conventions first
        const actorName = this.getTestActorModelName();
        if (this.model.fields['actorId']) return 'actorId';
        if (this.model.fields['userId'] && actorName.toLowerCase() === 'user') return 'userId';

        // Case 2: Resolve scalar FK from relation (e.g. team -> teamId)
        const scalarFK = this.findActorForeignKey();
        if (scalarFK) return scalarFK;

        // Case 3: Fallback to direct relation name (e.g. user: User) if no scalar found
        for (const [name, field] of Object.entries(this.model.fields)) {
            if (field.type && field.type.toLowerCase() === actorName.toLowerCase()) {
                return name;
            }
        }

        return null;
    }

    private getRequiredForeignKeys(): { field: string, model: string }[] {
        const requiredFKs: { field: string, model: string }[] = [];
        const actorRelationField = this.getActorRelationFieldName();

        for (const [name, field] of Object.entries(this.model.fields)) {
            if (field.isRelation && field.attributes) {
                const relationAttr = field.attributes.find(a => a.startsWith('@relation'));
                if (relationAttr) {
                    const match = relationAttr.match(/fields:\s*\[([^\]]+)\]/);
                    if (match) {
                        const scalars = match[1].split(',').map(f => f.trim());
                        for (const scalarName of scalars) {
                            // SKIP IF THIS IS THE ACTOR RELATION
                            if (actorRelationField && (scalarName === actorRelationField || name === actorRelationField)) {
                                continue;
                            }

                            const scalarField = this.model.fields[scalarName];
                            // Only include if required and not already handled (mockData excludes them)
                            if (scalarField && scalarField.isRequired) {
                                requiredFKs.push({ field: scalarName, model: field.type });
                            }
                        }
                    }
                }
            }
        }
        return requiredFKs;
    }

    private generateCreateTests(kebabEntity: string, camelEntity: string, mockData: any): string {
        const requiredFKs = this.getRequiredForeignKeys();
        const actorRelationField = this.getActorRelationFieldName();

        let dependencySetup = '';
        let payloadConstruction = `const payload = ${JSON.stringify(mockData, null, 8).replace(/"([^"]+)":/g, '$1:').replace(/"__DATE_NOW__"/g, "new Date().toISOString()")};`;

        // Check if we need to add FKs OR the actor relation to the payload
        if (requiredFKs.length > 0 || actorRelationField) {
            const setups = requiredFKs.map((fk, i) => {
                const varName = `${fk.model.charAt(0).toLowerCase() + fk.model.slice(1)}_${i}`;
                // Heuristic: If creating a Job as a dependency, link it to the actor
                const extras = fk.model === 'Job' ? ', actorId: (typeof actor !== "undefined" ? actor.id : undefined)' : '';
                return `const ${varName} = await Factory.create('${fk.model.charAt(0).toLowerCase() + fk.model.slice(1)}', {${extras.replace(/^, /, '')}});`;
            });
            dependencySetup = setups.join('\n            ');

            const overrides = requiredFKs.map((fk, i) => {
                const varName = `${fk.model.charAt(0).toLowerCase() + fk.model.slice(1)}_${i}`;
                return `${fk.field}: ${varName}.id`;
            });

            if (actorRelationField) {
                overrides.push(`${actorRelationField}: (actor ? actor.id : undefined)`);
            }

            const overridesString = overrides.join(',\n                ');

            payloadConstruction = `const payload = {
                ...${JSON.stringify(mockData).replace(/"__DATE_NOW__"/g, "new Date().toISOString()")},
                ${overridesString}
            };`;
        }

        return `
    // POST /api/${kebabEntity}
    describe('POST /api/${kebabEntity}', () => {
        it('should allow ${this.getRole('create')} to create ${camelEntity}', async () => {
            ${this.getActorStatement('create')}
            
            ${dependencySetup}
            ${payloadConstruction}

            const res = await client.post('/api/${kebabEntity}', payload);

            expect(res.status).toBe(201);
            expect(res.body.data).toBeDefined();
            ${Object.keys(mockData).filter(k => k !== 'id').map(k => {
            const field = this.model.fields[k];
            if (field && field.type === 'DateTime') {
                return `expect(res.body.data.${k}).toBe(payload.${k}); // API returns ISO string`;
            }
            if (field && (field.isList || field.type === 'Json')) {
                return `expect(res.body.data.${k}).toStrictEqual(payload.${k});`;
            }
            return `expect(res.body.data.${k}).toBe(payload.${k});`;
        }).join('\n            ')}

            const created = await Factory.prisma.${camelEntity}.findUnique({
                where: { id: res.body.data.id }
            });
            expect(created).toBeDefined();
        });

        it('should forbid non-admin/unauthorized users', async () => {
            ${this.getNegativeActorStatement('create')}
            ${dependencySetup ? dependencySetup : ''}
            ${payloadConstruction}
            const res = await client.post('/api/${kebabEntity}', payload);
            expect([401, 403, 404]).toContain(res.status);
        });
    });`;
    }

    private findActorForeignKey(): string | null {
        const actorName = this.getTestActorModelName();
        for (const [name, field] of Object.entries(this.model.fields)) {
            if (field.type && field.type.toLowerCase() === actorName.toLowerCase()) {
                // Found relation field. Now find scalar.
                if (field.attributes) {
                    const relationAttr = field.attributes.find(a => a.startsWith('@relation'));
                    if (relationAttr) {
                        const match = relationAttr.match(/fields:\s*\[([^\]]+)\]/);
                        if (match) {
                            // Assuming single field FK for actor relation
                            return match[1].split(',')[0].trim();
                        }
                    }
                }
                // Fallback to standard naming
                if (this.model.fields[`${name}Id`]) return `${name}Id`;
            }
        }
        return null; // No relation found
    }

    private generateListTests(kebabEntity: string, camelEntity: string, mockData: any): string {
        const actorModelName = this.getTestActorModelName();
        const isActorModel = this.model.name.toLowerCase() === actorModelName.toLowerCase();
        const actorFK = this.findActorForeignKey();

        const filterTests = Object.keys(this.model.fields)
            .filter(f => !['id', 'createdAt', 'updatedAt', 'actorId', 'userId', 'actorType'].includes(f) &&
                this.model.fields[f].type === 'String' &&
                this.model.fields[f].api !== false &&
                !this.model.fields[f].private &&
                !this.model.fields[f].isList &&
                !this.isForeignKey(f))
            .map(field => {
                const uniqueField = this.getUniqueField();
                let uniqueInjectionA = '';
                let uniqueInjectionB = '';

                if (uniqueField && uniqueField !== field) {
                    const isEmail = uniqueField === 'email';
                    const suffix = isEmail ? '@example.com' : '';
                    uniqueInjectionA = `, ${uniqueField}: 'filter_a_' + Date.now() + '${suffix}'`;
                    uniqueInjectionB = `, ${uniqueField}: 'filter_b_' + Date.now() + '${suffix}'`;
                }

                return `
        it('should filter by ${field}', async () => {
            // Wait to avoid collisions
            await new Promise(r => setTimeout(r, 10));
            // Reuse getActorStatement to ensure correct actor context
            ${this.getActorStatement('list')}
            ${this.model.test?.actor === 'user' && (this.model as any).role?.list !== 'admin' ? `// Note: Ensure role allows filtering if restricted` : ''}

            const val1 = '${field}_' + Date.now() + '_A${field === 'email' ? '@example.com' : ''}';
            await new Promise(r => setTimeout(r, 10));
            const val2 = '${field}_' + Date.now() + '_B${field === 'email' ? '@example.com' : ''}';
            
            const relationSnippet = ${JSON.stringify(this.getActorRelationSnippet())}.replace(/^, /, '').replace(/actor.id/g, 'actor.id');
            const data1 = { ...baseData, ${field}: val1${uniqueInjectionA} };
            const data2 = { ...baseData, ${field}: val2${uniqueInjectionB} };
            
            await Factory.create('${camelEntity}', { ...data1${this.getActorRelationSnippet()} });
            await Factory.create('${camelEntity}', { ...data2${this.getActorRelationSnippet()} });

            const res = await client.get('/api/${kebabEntity}?${field}=' + val1);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].${field}).toBe(val1);
        });`;
            }).join('\n');


        // Hueristic: Only preserve actor data if it's the actor itself OR an auth resource
        const isAuthResource = ['token', 'key', 'session'].some(k => camelEntity.toLowerCase().includes(k));
        const shouldPreserve = isActorModel || (isAuthResource && !!(this.findActorForeignKey()));

        let cleanupClause = '';
        if (shouldPreserve) {
            if (isActorModel) {
                cleanupClause = `await Factory.prisma.${camelEntity}.deleteMany({ where: { id: { not: actor.id } } });`;
            } else {
                cleanupClause = `await Factory.prisma.${camelEntity}.deleteMany({ where: { ${actorFK}: { not: actor.id } } });`;
            }
        } else {
            cleanupClause = `await Factory.prisma.${camelEntity}.deleteMany();`;
        }


        return `
    // GET /api/${kebabEntity}
    describe('GET /api/${kebabEntity}', () => {
        const baseData = ${JSON.stringify(mockData).replace(/"__DATE_NOW__"/g, "new Date().toISOString()")};

        it('should allow ${this.getRole('list')} to list ${camelEntity}s', async () => {
             ${this.getActorStatement('list')}
             
             // Cleanup first to ensure clean state
             ${cleanupClause}

            // Seed data
            const suffix = Date.now();
            ${(() => {
                const unique = this.getUniqueField();
                const rel = this.getActorRelationSnippet();
                if (unique) {
                    const s = unique === 'email' ? '@example.com' : '';
                    return `await Factory.create('${camelEntity}', { ...baseData, ${unique}: 'list_1_' + suffix + '${s}'${rel} });
            await Factory.create('${camelEntity}', { ...baseData, ${unique}: 'list_2_' + suffix + '${s}'${rel} });`;
                }
                return `await Factory.create('${camelEntity}', { ...baseData${rel} });
            await Factory.create('${camelEntity}', { ...baseData${rel} });`;
            })()}

            const res = await client.get('/api/${kebabEntity}');

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThanOrEqual(2);
            expect(res.body.meta).toBeDefined();
        });

        it('should verify pagination metadata', async () => {
            ${this.getActorStatement('list')}
            
            // Cleanup and seed specific count
            ${cleanupClause}
            
            const suffix = Date.now();
            const createdIds: string[] = [];
            const totalTarget = 15;
            let currentCount = 0;
            ${(() => {
                if (cleanupClause.includes('where')) {
                    const field = isActorModel ? 'id' : (this.findActorForeignKey() || 'userId');
                    return `currentCount = await Factory.prisma.${camelEntity}.count({ where: { ${field}: actor.id } });`;
                }
                return '';
            })()}
            
            const toCreate = totalTarget - currentCount;

            for (let i = 0; i < toCreate; i++) {
                ${(() => {
                const unique = this.getUniqueField();
                const rel = this.getActorRelationSnippet();
                if (unique) {
                    const s = unique === 'email' ? '@example.com' : '';
                    return `const rec = await Factory.create('${camelEntity}', { ...baseData, ${unique}: \`page_\${i}_\${suffix}${s}\`${rel} });
                            createdIds.push(rec.id);`;
                }
                return `const rec = await Factory.create('${camelEntity}', { ...baseData${rel} });
                        createdIds.push(rec.id);`;
            })()}
            }

            // Page 1
            const res1 = await client.get('/api/${kebabEntity}?take=5&skip=0');
            expect(res1.status).toBe(200);
            expect(res1.body.data.length).toBe(5);
            expect(res1.body.meta.total).toBe(15);

            // Page 2
            const res2 = await client.get('/api/${kebabEntity}?take=5&skip=5');
            expect(res2.status).toBe(200);
            expect(res2.body.data.length).toBe(5);
            expect(res2.body.data[0].id).not.toBe(res1.body.data[0].id);
        });

        ${filterTests}
    });`;
    }

    private generateGetTests(kebabEntity: string, camelEntity: string, mockData: any): string {
        const isActorModel = this.model.name.toLowerCase() === this.getTestActorModelName().toLowerCase();

        const requiredFKs = this.getRequiredForeignKeys();
        let dependencySetup = '';
        let overrides = '';

        if (!isActorModel && requiredFKs.length > 0) {
            const setups = requiredFKs.map((fk, i) => {
                const varName = `${fk.model.charAt(0).toLowerCase() + fk.model.slice(1)}_${i}`;
                const extras = fk.model === 'Job' ? ', actorId: (typeof actor !== "undefined" ? actor.id : undefined)' : '';
                return `const ${varName} = await Factory.create('${fk.model.charAt(0).toLowerCase() + fk.model.slice(1)}', {${extras.replace(/^, /, '')}});`;
            });
            dependencySetup = setups.join('\n            ');

            overrides = requiredFKs.map((fk, i) => {
                const varName = `${fk.model.charAt(0).toLowerCase() + fk.model.slice(1)}_${i}`;
                const relationName = fk.field.endsWith('Id') ? fk.field.slice(0, -2) : fk.field;
                return `${relationName}: { connect: { id: ${varName}.id } }`;
            }).join(', ');
            if (overrides) overrides = `, ${overrides}`;
        }

        let setupSnippet = '';
        if (isActorModel) {
            setupSnippet = `const target = actor;`;
        } else {
            // Include overrides for FKs
            setupSnippet = `
            ${dependencySetup}
            const target = await Factory.create('${camelEntity}', { ...${JSON.stringify(mockData).replace(/"__DATE_NOW__"/g, "new Date().toISOString()")}${this.getActorRelationSnippet()}${overrides} });`;
        }

        return `
    // GET /api/${kebabEntity}/[id]
    describe('GET /api/${kebabEntity}/[id]', () => {
        it('should retrieve a specific ${camelEntity}', async () => {
            ${this.getActorStatement('get')}
            
            ${setupSnippet}

            const res = await client.get(\`/api/${kebabEntity}/\${target.id}\`);

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(target.id);
        });

        it('should return 404 for missing id', async () => {
             ${this.getActorStatement('get')}
             const res = await client.get('/api/${kebabEntity}/missing-id-123');
             expect(res.status).toBe(404);
        });
    });`;
    }

    private generateUpdateTests(kebabEntity: string, camelEntity: string, mockData: any, updateData: any): string {
        const updatePayload = JSON.stringify(updateData, null, 8).replace(/"([^"]+)":/g, '$1:').replace(/"__DATE_NOW__"/g, "new Date().toISOString()");
        const isActorModel = this.model.name.toLowerCase() === this.getTestActorModelName().toLowerCase();

        const requiredFKs = this.getRequiredForeignKeys();
        let dependencySetup = '';
        let overrides = '';

        if (!isActorModel && requiredFKs.length > 0) {
            const setups = requiredFKs.map((fk, i) => {
                const varName = `${fk.model.charAt(0).toLowerCase() + fk.model.slice(1)}_${i}`;
                const extras = fk.model === 'Job' ? ', actorId: (typeof actor !== "undefined" ? actor.id : undefined)' : '';
                return `const ${varName} = await Factory.create('${fk.model.charAt(0).toLowerCase() + fk.model.slice(1)}', {${extras.replace(/^, /, '')}});`;
            });
            dependencySetup = setups.join('\n            ');

            overrides = requiredFKs.map((fk, i) => {
                const varName = `${fk.model.charAt(0).toLowerCase() + fk.model.slice(1)}_${i}`;
                const relationName = fk.field.endsWith('Id') ? fk.field.slice(0, -2) : fk.field;
                return `${relationName}: { connect: { id: ${varName}.id } }`;
            }).join(', ');
            if (overrides) overrides = `, ${overrides}`;
        }

        let setupSnippet = '';
        if (isActorModel) {
            setupSnippet = `const target = actor;`;
        } else {
            setupSnippet = `
            ${dependencySetup}
            const target = await Factory.create('${camelEntity}', { ...${JSON.stringify(mockData).replace(/"__DATE_NOW__"/g, "new Date().toISOString()")}${this.getActorRelationSnippet()}${overrides} });`;
        }

        return `
    // PUT /api/${kebabEntity}/[id]
    describe('PUT /api/${kebabEntity}/[id]', () => {
        it('should update ${camelEntity}', async () => {
            ${this.getActorStatement('update')}
            
            ${setupSnippet}

            const updatePayload = ${updatePayload};

            const res = await client.put(\`/api/${kebabEntity}/\${target.id}\`, updatePayload);

            expect(res.status).toBe(200);
            
            const updated = await Factory.prisma.${camelEntity}.findUnique({ where: { id: target.id } });
            ${Object.keys(updateData).map(k => {
            const field = this.model.fields[k];
            if (field && field.type === 'DateTime') {
                return `expect(updated?.${k}.toISOString()).toBe(updatePayload.${k}); // Compare as ISO strings`;
            }
            if (field && (field.isList || field.type === 'Json')) {
                return `expect(updated?.${k}).toStrictEqual(updatePayload.${k});`;
            }
            return `expect(updated?.${k}).toBe(updatePayload.${k});`;
        }).join('\n            ')}
        });
    });`;
    }

    private generateDeleteTests(kebabEntity: string, camelEntity: string, mockData: any): string {
        const isActorModel = this.model.name.toLowerCase() === this.getTestActorModelName().toLowerCase();

        const requiredFKs = this.getRequiredForeignKeys();
        let dependencySetup = '';
        let overrides = '';

        if (!isActorModel && requiredFKs.length > 0) {
            const setups = requiredFKs.map((fk, i) => {
                const varName = `${fk.model.charAt(0).toLowerCase() + fk.model.slice(1)}_${i}`;
                const extras = fk.model === 'Job' ? ', actorId: (typeof actor !== "undefined" ? actor.id : undefined)' : '';
                return `const ${varName} = await Factory.create('${fk.model.charAt(0).toLowerCase() + fk.model.slice(1)}', {${extras.replace(/^, /, '')}});`;
            });
            dependencySetup = setups.join('\n            ');

            overrides = requiredFKs.map((fk, i) => {
                const varName = `${fk.model.charAt(0).toLowerCase() + fk.model.slice(1)}_${i}`;
                const relationName = fk.field.endsWith('Id') ? fk.field.slice(0, -2) : fk.field;
                return `${relationName}: { connect: { id: ${varName}.id } }`;
            }).join(', ');
            if (overrides) overrides = `, ${overrides}`;
        }

        let setupSnippet = '';
        if (isActorModel) {
            setupSnippet = `const target = actor;`;
        } else {
            setupSnippet = `
            ${dependencySetup}
            const target = await Factory.create('${camelEntity}', { ...${JSON.stringify(mockData).replace(/"__DATE_NOW__"/g, "new Date().toISOString()")}${this.getActorRelationSnippet()}${overrides} });`;
        }

        return `
    // DELETE /api/${kebabEntity}/[id]
    describe('DELETE /api/${kebabEntity}/[id]', () => {
        it('should delete ${camelEntity}', async () => {
            ${this.getActorStatement('delete')}
            
            ${setupSnippet}

            const res = await client.delete(\`/api/${kebabEntity}/\${target.id}\`);

            expect(res.status).toBe(200);

            const check = await Factory.prisma.${camelEntity}.findUnique({ where: { id: target.id } });
            expect(check).toBeNull();
        });
    });`;
    }

    private generateMockData(): Record<string, any> {
        // ... existing logic ...
        const data: Record<string, any> = {};
        for (const [name, field] of Object.entries(this.model.fields)) {
            const isIdWithDefault = name === 'id' && field.attributes?.some(a => a.startsWith('@default'));
            if ((name === 'id' && isIdWithDefault) || name === 'createdAt' || name === 'updatedAt' || field.api === false || (field as any).private) continue;

            if (this.isForeignKey(name)) continue;

            if (!field.isRequired) continue;
            let val: any = null;
            if (field.type === 'String') val = `${name}_test`;
            else if (field.type === 'Boolean') val = true;
            else if (field.type === 'Int') val = 10;
            else if (field.type === 'Float' || field.type === 'Decimal') val = 10.5;
            else if (field.type === 'DateTime') val = "__DATE_NOW__";

            if (val !== null) {
                if (field.isList) {
                    data[name] = [val];
                } else {
                    data[name] = val;
                }
            }
        }
        return data;
    }

    private generateUpdateData(): Record<string, any> {
        // ... existing logic ...
        const data: Record<string, any> = {};
        for (const [name, field] of Object.entries(this.model.fields)) {
            const isIdWithDefault = name === 'id' && field.attributes?.some(a => a.startsWith('@default'));
            if ((name === 'id' && isIdWithDefault) || name === 'createdAt' || name === 'updatedAt' || field.api === false || (field as any).private) continue;

            if (this.isForeignKey(name)) continue;

            // Security: Don't attempt to update ownership, state or reserved fields
            const reserved = [
                'id', 'createdAt', 'updatedAt',
                'actorId', 'userId', 'actorType',
                'lockedBy', 'lockedAt', 'status',
                'result', 'error', 'startedAt', 'completedAt'
            ];
            if (reserved.includes(name)) continue;

            let val: any = null;
            if (field.type === 'String') val = `${name}_updated`;
            else if (field.type === 'Boolean') val = false;
            else if (field.type === 'Int') val = 20;
            else if (field.type === 'Float' || field.type === 'Decimal') val = 20.5;
            else if (field.type === 'DateTime') val = "__DATE_NOW__";

            if (val !== null) {
                if (field.isList) {
                    data[name] = [val];
                } else {
                    data[name] = val;
                }
            }
        }
        return data;
    }
}

