import { BaseCommand } from '../base';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import YAML from 'yaml';
import { Project, SourceFile } from 'ts-morph';
import { z } from 'zod';
import { PlatformDefinitionSchema, PlatformApiDefinitionSchema } from '../../schema';

// Builders
import { ModelParser } from '../../engine/model-parser';
import { ServiceBuilder } from '../../engine/builders/service-builder';
import { ApiBuilder } from '../../engine/builders/api-builder';
import { SdkBuilder } from '../../engine/builders/sdk-builder';
import { SdkIndexBuilder } from '../../engine/builders/sdk-index-builder';
import { InitBuilder } from '../../engine/builders/init-builder';
import { TestBuilder } from '../../engine/builders/test-builder';
import { ActionBuilder } from '../../engine/builders/action-builder';
import { TypeBuilder } from '../../engine/builders/type-builder';
import { FactoryBuilder } from '../../engine/builders/factory-builder';
import { ActorBuilder } from '../../engine/builders/actor-builder';
import { ActorTypeBuilder } from '../../engine/builders/actor-type-builder';
import { type CustomRoute, type ModelDef } from '../../engine/types';
import { ModuleLocator } from '../../lib/module-locator';

export class AuditApiCommand extends BaseCommand {
  constructor() {
    super({
      name: 'audit:api',
      description: 'Audit web-api module code against models.yaml',
      args: {
        '[name]': 'The name of the module (or glob pattern) to audit. Defaults to "*-api".',
      },
      options: {
        '--schema': 'Validate models.yaml and api.yaml schemas only',
      },
      helpMetadata: {
        examples: [
          '$ arc audit:api',
          '$ arc audit:api billing-api',
          '$ arc audit:api "*-api" --schema',
          '$ arc audit:api billing-api --schema',
        ],
      },
    });
  }

  async run(name: string | undefined, options: { schema?: boolean }) {
    const pattern = name || '*-api';
    const modules = await ModuleLocator.expand(pattern);

    if (modules.length === 0) {
      console.log(chalk.yellow(`No modules found matching pattern "${pattern}"`));
      return;
    }

    console.log(chalk.blue(`Found ${modules.length} module(s) to audit.`));

    let totalIssues: string[] = [];
    const spinner = ora('Auditing modules...').start();

    for (const moduleName of modules) {
      spinner.text = `Auditing module: ${moduleName}`;
      const issues = await this.auditModule(moduleName, options.schema || false);
      totalIssues = totalIssues.concat(issues);
    }

    if (totalIssues.length > 0) {
      spinner.fail(chalk.red(`Audit failed with ${totalIssues.length} issues:`));
      totalIssues.forEach((issue) => console.log(issue));
      process.exitCode = 1;
    } else {
      spinner.succeed(chalk.green(`Audit passed for all ${modules.length} modules.`));
    }
  }

  private async auditModule(name: string, checkSchemaOnly: boolean): Promise<string[]> {
    const moduleDir = path.join(process.cwd(), 'modules', name);
    const modelsPath = path.join(moduleDir, 'models.yaml');
    const apiPath = path.join(moduleDir, 'api.yaml');

    const issues: string[] = [];
    const report = (msg: string) => issues.push(`[${name}] ${msg}`);

    try {
      // 1. Schema Validation
      if (!fs.existsSync(modelsPath)) {
        report(`models.yaml not found at: ${modelsPath}`);
        return issues;
      }

      const modelsContent = fs.readFileSync(modelsPath, 'utf8');
      let parsedModels: any;
      try {
        parsedModels = YAML.parse(modelsContent);
      } catch (e: any) {
        report(`Failed to parse models.yaml: ${e.message}`);
        return issues;
      }

      // Validate against Zod Schema
      const modelResult = PlatformDefinitionSchema.safeParse(parsedModels);
      if (!modelResult.success) {
        report(chalk.bold.red(`[Schema] models.yaml validation errors:`));
        modelResult.error.errors.forEach((err) => {
          report(chalk.red(`  Path: ${err.path.join('.')} - ${err.message}`));
        });
      }

      // Validate api.yaml if exists
      if (fs.existsSync(apiPath)) {
        try {
          const apiContent = fs.readFileSync(apiPath, 'utf8');
          const parsedApi = YAML.parse(apiContent);
          const apiResult = PlatformApiDefinitionSchema.safeParse(parsedApi);

          if (!apiResult.success) {
            report(chalk.bold.red(`[Schema] api.yaml validation errors:`));
            apiResult.error.errors.forEach((err) => {
              report(chalk.red(`  Path: ${err.path.join('.')} - ${err.message}`));
            });
          }
        } catch (e: any) {
          report(chalk.red(`[Schema] Failed to parse api.yaml: ${e.message}`));
        }
      }

      // 2. Semantic Validation (Types & Roles)
      const validTypes = new Set([
        'String',
        'Boolean',
        'Int',
        'BigInt',
        'Float',
        'Decimal',
        'DateTime',
        'Json',
        'Bytes', // Prisma Scalars
        'unknown',
        'any',
        'void', // Special Types
      ]);

      const validRoles = new Set<string>();
      validRoles.add('none'); // "none" is always valid

      // Extract Types from Models & Enums
      if (parsedModels.models) {
        Object.keys(parsedModels.models).forEach((k) => validTypes.add(k));
      }
      if (parsedModels.enums) {
        Object.keys(parsedModels.enums).forEach((k) => validTypes.add(k));
      }

      // Extract Roles from ALL Modules (Cross-Module Scanning)
      const modulesRoot = path.join(process.cwd(), 'modules');
      if (fs.existsSync(modulesRoot)) {
        const globalModules = fs.readdirSync(modulesRoot);
        for (const mod of globalModules) {
          const rolesDir = path.join(modulesRoot, mod, 'src', 'roles');
          if (fs.existsSync(rolesDir)) {
            const roleFiles = fs.readdirSync(rolesDir).filter((f: string) => f.endsWith('.ts'));
            roleFiles.forEach((f: string) => validRoles.add(path.basename(f, '.ts')));
          }
        }
      }

      // Validate Models.yaml Semantics
      if (parsedModels.models) {
        for (const [modelName, modelDef] of Object.entries<any>(parsedModels.models)) {
          // Validate Fields
          if (modelDef.fields) {
            for (const [fieldName, fieldDef] of Object.entries<any>(modelDef.fields)) {
              const fieldType = typeof fieldDef === 'string' ? fieldDef : fieldDef.type;
              if (!validTypes.has(fieldType)) {
                report(
                  chalk.red(
                    `[Semantic] Model '${modelName}.${fieldName}' has unknown type '${fieldType}'`,
                  ),
                );
              }
            }
          }

          // Validate Role (String or Map)
          if (modelDef.role) {
            const rolesToCheck: string[] = [];
            if (typeof modelDef.role === 'string') {
              rolesToCheck.push(modelDef.role);
            } else if (typeof modelDef.role === 'object') {
              Object.values(modelDef.role).forEach((r: any) => rolesToCheck.push(r));
            }

            rolesToCheck.forEach((r) => {
              if (!validRoles.has(r)) {
                report(
                  chalk.red(
                    `[Semantic] Model '${modelName}' has unknown role '${r}'. Valid: ${Array.from(validRoles).join(', ')}`,
                  ),
                );
              }
            });
          }
        }
      }

      // Validate Api.yaml Semantics
      if (fs.existsSync(apiPath)) {
        try {
          const apiContent = fs.readFileSync(apiPath, 'utf8');
          const parsedApi = YAML.parse(apiContent) as Record<string, CustomRoute[]>;

          for (const [entityName, routes] of Object.entries(parsedApi)) {
            routes.forEach((route, idx) => {
              const label = `api.yaml [${entityName}][${idx}] ${route.path}`;

              // Check Input Type
              if (route.input) {
                const inputType = route.input.endsWith('[]')
                  ? route.input.slice(0, -2)
                  : route.input;
                if (!validTypes.has(inputType)) {
                  report(chalk.red(`[Semantic] ${label} has unknown input type '${route.input}'`));
                }
              }

              // Check Output Type
              if (route.output) {
                const outputType = route.output.endsWith('[]')
                  ? route.output.slice(0, -2)
                  : route.output;
                if (!validTypes.has(outputType)) {
                  report(
                    chalk.red(`[Semantic] ${label} has unknown output type '${route.output}'`),
                  );
                }
              }

              // Check Role
              if (route.role) {
                if (!validRoles.has(route.role)) {
                  report(
                    chalk.red(
                      `[Semantic] ${label} has unknown role '${route.role}'. Valid: ${Array.from(validRoles).join(', ')}`,
                    ),
                  );
                }
              }
            });
          }
        } catch (e) {
          // Parsed before, redundant catch but safe
        }
      }

      if (checkSchemaOnly) {
        return issues;
      }

      // 2. Full Code Audit
      const project = new Project({
        skipAddingFilesFromTsConfig: true,
        compilerOptions: {
          target: 99, // ESNext
          module: 99, // ESNext
          moduleResolution: 2, // Node
          esModuleInterop: true,
          skipLibCheck: true,
          strict: false,
        },
      });
      const { models, enums } = ModelParser.parse(modelsPath); // This also does some validation

      const customRoutes: Record<string, CustomRoute[]> = fs.existsSync(apiPath)
        ? YAML.parse(fs.readFileSync(apiPath, 'utf-8'))
        : {};

      const getFile = (relPath: string): SourceFile | undefined => {
        const absPath = path.join(moduleDir, relPath);
        if (!fs.existsSync(absPath)) {
          report(`[Missing] ${relPath}`);
          return undefined;
        }
        return project.addSourceFileAtPath(absPath);
      };

      const validate = (builder: any, file: SourceFile | undefined, label: string) => {
        if (!file) return;
        const res = builder.validate(file);
        if (!res.valid) {
          res.issues.forEach((i: string) => report(`[${label}] ${i}`));
        }
      };

      // --- Validation Logic Mirrored from ApiModuleGenerator ---

      // 1. Types
      validate(new TypeBuilder(models, enums), getFile('src/sdk/types.ts'), 'SDK Types');

      const processedModels = new Set(models.map((m) => m.name));

      for (const model of models) {
        const entityName = model.name;
        const kebabName = entityName
          .replace(/([a-z])([A-Z])/g, '$1-$2')
          .replace(/[\s_]+/g, '-')
          .toLowerCase();

        // Services
        if (model.db) {
          validate(
            new ServiceBuilder(model),
            getFile(`src/services/${kebabName}-service.ts`),
            `${entityName}Service`,
          );
        }

        if (model.api) {
          if (model.db) {
            validate(
              new ApiBuilder(model, models, name, 'collection'),
              getFile(`src/pages/api/${kebabName}/index.ts`),
              `${entityName}API List`,
            );
            validate(
              new ApiBuilder(model, models, name, 'individual'),
              getFile(`src/pages/api/${kebabName}/[id].ts`),
              `${entityName}API Detail`,
            );
          }

          // Custom Routes
          const modelRoutes = customRoutes[entityName] || [];
          for (const route of modelRoutes) {
            const routePath = route.path.startsWith('/') ? route.path.slice(1) : route.path;
            validate(
              new ApiBuilder(model, models, name, 'custom', [route]),
              getFile(`src/pages/api/${kebabName}/${routePath}.ts`),
              `${entityName}API ${routePath}`,
            );

            const actionName = `${route.method.charAt(0).toUpperCase() + route.method.slice(1)}${entityName}Action`;
            const actionPath = `src/actions/${route.method.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}-${kebabName}.ts`;
            validate(
              new ActionBuilder(actionName, route.input || 'any', route.output || 'any'),
              getFile(actionPath),
              `${entityName}Action`,
            );
          }

          // SDK
          validate(
            new SdkBuilder(model, modelRoutes),
            getFile(`src/sdk/${kebabName}-sdk.ts`),
            `${entityName}SDK`,
          );

          // Tests
          if (model.db) {
            const ops: ('create' | 'list' | 'get' | 'update' | 'delete')[] = [
              'create',
              'list',
              'get',
              'update',
              'delete',
            ];
            for (const op of ops) {
              validate(
                new TestBuilder(model, name, op),
                getFile(`tests/integration/api/${kebabName}/${op}.test.ts`),
                `${entityName}Test ${op}`,
              );
            }
          }
        }
      }

      // Virtual Resources
      const virtualModels: ModelDef[] = [];
      for (const [entityName, routes] of Object.entries(customRoutes)) {
        if (processedModels.has(entityName)) continue;

        const kebabEntity = entityName
          .replace(/([a-z])([A-Z])/g, '$1-$2')
          .replace(/[\s_]+/g, '-')
          .toLowerCase();
        const isRoot = entityName === 'Root';

        const virtualModel: ModelDef = {
          name: entityName,
          api: true,
          fields: {},
        };
        virtualModels.push(virtualModel);

        // API Routes
        for (const route of routes) {
          const routePath = route.path.startsWith('/') ? route.path.slice(1) : route.path;
          const fileName = routePath === '' ? 'index' : routePath;

          let apiPath: string;
          if (isRoot) {
            apiPath = `src/pages/api/${fileName}.ts`;
          } else {
            apiPath = `src/pages/api/${kebabEntity}/${fileName}.ts`;
          }

          validate(
            new ApiBuilder(virtualModel, [...models, ...virtualModels], name, 'custom', [route]),
            getFile(apiPath),
            `${entityName}API ${fileName}`,
          );

          // Action
          const actionName = `${route.method.charAt(0).toUpperCase() + route.method.slice(1)}${entityName}Action`;
          const kebabMethod = route.method.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
          const actionPath = `src/actions/${kebabMethod}-${kebabEntity}.ts`;
          validate(
            new ActionBuilder(actionName, route.input || 'any', route.output || 'any'),
            getFile(actionPath),
            `${entityName}Action`,
          );
        }

        // SDK
        const sdkPath = isRoot ? `src/sdk/root-sdk.ts` : `src/sdk/${kebabEntity}-sdk.ts`;
        validate(new SdkBuilder(virtualModel, routes), getFile(sdkPath), `${entityName}SDK`);
      }

      // Global Files
      validate(
        new SdkIndexBuilder([...models, ...virtualModels], name),
        getFile('src/sdk/index.ts'),
        'SDK Index',
      );
      validate(new FactoryBuilder(models), getFile('tests/integration/factory.ts'), 'Data Factory');
      validate(new ActorBuilder(models), getFile('tests/integration/actors.ts'), 'Actors');
      validate(new ActorTypeBuilder(models), getFile('src/types.d.ts'), 'Actor Types');
      validate(new InitBuilder('server'), getFile('src/server-init.ts'), 'Server Init');

      return issues;
    } catch (error: any) {
      report(`Audit threw exception: ${error.message}`);
      return issues;
    }
  }
}
