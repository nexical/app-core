import { describe, it, expect } from 'vitest';
import { FactoryBuilder } from '@nexical/generator/engine/builders/factory-builder';
import { TestBuilder } from '@nexical/generator/engine/builders/test-builder';
import { type ModelDef } from '@nexical/generator/engine/types';

describe('Builders Sweeper', () => {

    describe('FactoryBuilder Edge Cases', () => {
        it('should handle boolean, datetime, enums, list types, and password', () => {
            const model: ModelDef = {
                name: 'ComplexModel',
                fields: {
                    id: { type: 'String', isRequired: true },
                    isActive: { type: 'boolean', isRequired: true },
                    bornAt: { type: 'datetime', isRequired: true }, // Changed from createdAt
                    role: { type: 'SiteRole', isRequired: true },
                    status: { type: 'UserStatus', isRequired: true },
                    mode: { type: 'UserMode', isRequired: true },
                    tags: { type: 'String', isRequired: true, isList: true },
                    password: { type: 'String', isRequired: true }
                }
            };

            const builder = new FactoryBuilder([model]);
            const file = (builder as any).getSchema();
            const content = file.variables?.[0].initializer || '';

            expect(content).toContain('isActive: true');
            expect(content).toContain('bornAt: new Date()'); // Changed expectation
            expect(content).toContain("role: 'EMPLOYEE'");
            expect(content).toContain("status: 'ACTIVE'");
            expect(content).toContain("mode: 'SINGLE'");
            expect(content).toContain('tags: [`tags_${index}`]'); // Expected list format?
            expect(content).toContain("password: hashPassword('Password123!')");
        });
    });

    describe('TestBuilder Edge Cases', () => {
        const baseModel: ModelDef = {
            name: 'TestModel',
            fields: { id: { type: 'String', isRequired: true } },
            test: { actor: 'User' }
        };

        it('should use role object configuration', () => {
            const model: ModelDef = {
                ...baseModel,
                role: { create: 'admin' } // Object role config
            };
            const builder = new TestBuilder(model, 'mod', 'create');
            // Just verifying it runs without error and internal logic holds
            const file = (builder as any).getSchema();
            expect(file).toBeDefined();
        });

        it('should use roleConfig for actor options', () => {
            const builder = new TestBuilder(baseModel, 'mod', 'create', {
                member: { headers: { 'X-Custom': 'val' } }
            });
            const file = (builder as any).getSchema();
            const content = file.variables?.[0].initializer || '';

            // Expect generated content (note: keys might be unquoted due to naive replacement in builder)
            expect(content).toContain('headers:');
            expect(content).toContain('X-Custom:');
            expect(content).toContain('val');
        });

        it('should throw if actor is missing', () => {
            const model: ModelDef = { name: 'NoActor', fields: {} };
            const builder = new TestBuilder(model, 'mod', 'create');
            expect(() => (builder as any).getSchema()).toThrow('missing required');
        });

        it('should handle getActorRelationSnippet edge cases', () => {
            // Case 1: Recursive - Self reference check
            const teamModel: ModelDef = {
                name: 'Team',
                fields: { id: { type: 'String', isRequired: true } },
                test: { actor: 'Team' }
            };
            const b1 = new TestBuilder(teamModel, 'mod', 'create');
            const c1 = (b1 as any).getSchema().variables?.[0].initializer || '';
            // Expect NOT to have actor override in payload for self-model?
            // Actually `generateCreateTests` checks `actorRelationField`.
            expect(c1).not.toContain('actorId: (actor ?');

            // Case 2: Explicit Actor Type Field match
            const jobModel: ModelDef = {
                name: 'Job',
                fields: {
                    id: { type: 'String', isRequired: true },
                    manager: { type: 'Manager', isRequired: true } // Matches actor 'Manager'
                },
                test: { actor: 'Manager' }
            };
            const b2 = new TestBuilder(jobModel, 'mod', 'create');
            const c2 = (b2 as any).getSchema().variables?.[0].initializer || '';
            // For CREATE, it generates: manager: (actor ? actor.id : undefined)
            expect(c2).toContain('manager: (actor ? actor.id : undefined)');

            // Case 3: userId
            const postModel: ModelDef = {
                name: 'Post',
                fields: {
                    id: { type: 'String', isRequired: true },
                    userId: { type: 'String', isRequired: true }
                },
                test: { actor: 'User' }
            };
            const b3 = new TestBuilder(postModel, 'mod', 'create');
            const c3 = (b3 as any).getSchema().variables?.[0].initializer || '';
            expect(c3).toContain('userId: (actor ? actor.id : undefined)');
        });

        it('should find actor Foreign Key via regex', () => {
            const model: ModelDef = {
                name: 'UserSession', // Must contain "Session" to trigger auth resource logic
                fields: {
                    id: { type: 'String', isRequired: true },
                    owner: {
                        type: 'User',
                        isRequired: true,
                        isRelation: true,
                        attributes: ['@relation(fields: [ownerId], references: [id])']
                    },
                    ownerId: { type: 'String', isRequired: true }
                },
                test: { actor: 'User' }
            };

            const builder = new TestBuilder(model, 'mod', 'list');
            const file = (builder as any).getSchema();
            const content = file.variables?.[0].initializer || '';

            expect(content).toContain('ownerId: { not: actor.id }');
        });

        it('should handle public role', () => {
            const model: ModelDef = {
                name: 'PublicResource',
                fields: { id: { type: 'String', isRequired: true } },
                role: 'public', // Short string format
                test: { actor: 'User' }
            };
            const builder = new TestBuilder(model, 'mod', 'create');
            const file = (builder as any).getSchema();
            const content = file.variables?.[0].initializer || '';

            expect(content).toContain('Public access - no auth required');
        });

        it('should select unique field for filtering', () => {
            const model: ModelDef = {
                name: 'UniqueResource',
                fields: {
                    id: { type: 'String', isRequired: true },
                    email: { type: 'String', isRequired: true, attributes: ['@unique'] },
                    other: { type: 'String', isRequired: true }
                },
                test: { actor: 'User' }
            };
            // List operation triggers valid filter generation
            const builder = new TestBuilder(model, 'mod', 'list');
            const file = (builder as any).getSchema();
            const content = file.variables?.[0].initializer || '';

            // filter by 'other', creating 'email' unique values
            expect(content).toContain("email: 'filter_a_'");
            expect(content).toContain("email: 'filter_b_'");
        });
    });

    describe('FactoryBuilder Ignored Models', () => {
        it('should skip db:false models', () => {
            const model: ModelDef = {
                name: 'Ignored',
                db: false,
                fields: { id: { type: 'String', isRequired: true } }
            };
            const builder = new FactoryBuilder([model]);
            const file = (builder as any).getSchema();
            // Should have empty factories variable initializer (or just empty object)
            expect(file.variables[0].initializer.replace(/\s/g, '')).toBe('{}');
        });
    });
});
