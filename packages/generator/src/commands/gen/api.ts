 
import { BaseCommand } from '../base';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { ApiModuleGenerator } from '../../engine/api-module-generator';
import { ModuleLocator } from '../../lib/module-locator';
import { glob } from 'glob';

export class GenApiCommand extends BaseCommand {
  constructor() {
    super({
      name: 'gen:api',
      description: 'Generate web-api module code from models.yaml',
      args: {
        '[name]': 'The name of the module (or glob pattern) to generate. Defaults to "*-api".',
      },
      helpMetadata: {
        examples: ['$ arc gen:api', '$ arc gen:api billing-api', '$ arc gen:api "*-api"'],
      },
    });
  }

  async run(name?: string) {
    const pattern = name || '*-api';
    const modules = await ModuleLocator.expand(pattern);

    // specific check: if no modules found but the name is NOT a glob,
    // implies the user matched nothing but might want to create a NEW module.
    if (modules.length === 0 && !glob.hasMagic(pattern)) {
      modules.push(pattern);
    }

    if (modules.length === 0) {
      console.log(chalk.yellow(`No modules found matching pattern "${pattern}"`));
      return;
    }

    console.log(chalk.blue(`Found ${modules.length} module(s) to generate.`));

    for (const moduleName of modules) {
      await this.generateForModule(moduleName);
    }
  }

  private async generateForModule(name: string) {
    console.log(chalk.magenta(`\nGenerating code for module: ${name}`));
    const moduleDir = path.join(process.cwd(), 'modules', name);

    try {
      // 0. Ensure Module Directory & Project Files
      if (!fs.existsSync(moduleDir)) {
        console.log(chalk.blue(`Module '${name}' does not exist. Creating...`));
        await fs.ensureDir(path.join(moduleDir, 'src'));
      }

      // Scaffolding
      await this.generateProjectFiles(moduleDir, name);

      // 1. Run Generator
      const generator = new ApiModuleGenerator(moduleDir);
      await generator.run();

      console.log(chalk.green(`Successfully generated code for "${name}"`));
    } catch (error) {
      console.error(error);
      console.log(chalk.red('Failed to generate code'));
      throw error;
    }
  }

  private async generateProjectFiles(moduleDir: string, name: string) {
    // package.json
    const pkgPath = path.join(moduleDir, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      const pkg = {
        name: `@modules/${name}`,
        version: '0.0.0',
        type: 'module',
        private: true,
        exports: { './*': './src/*' },
        dependencies: {
          '@prisma/client': '^5.7.0',
          zod: '^3.22.4',
        },
      };
      await fs.writeJSON(pkgPath, pkg, { spaces: 4 });
    }

    // tsconfig.json
    const tsconfigPath = path.join(moduleDir, 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) {
      const tsconfig = {
        extends: '../../tsconfig.json',
        compilerOptions: { baseUrl: '../../' },
        include: ['src/**/*', '../../src/**/*'],
      };
      await fs.writeJSON(tsconfigPath, tsconfig, { spaces: 4 });
    }

    // module.config.mjs
    const configPath = path.join(moduleDir, 'module.config.mjs');
    if (!fs.existsSync(configPath)) {
      const content = `export default {\n    type: 'feature',\n    order: 50\n};\n`;
      await fs.writeFile(configPath, content);
    }

    // .env.example
    const envPath = path.join(moduleDir, '.env.example');
    if (!fs.existsSync(envPath)) {
      await fs.writeFile(envPath, `# Env vars for @modules/${name}\n`);
    }

    // models.yaml
    const modelsPath = path.join(moduleDir, 'models.yaml');
    if (!fs.existsSync(modelsPath)) {
      const modelName = name
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
      const content = `models:
  ${modelName}:
    fields:
      id:
        type: String
        attributes:
          - "@id"
          - "@default(cuid())"
      name:
        type: String
        isRequired: false
      createdAt:
        type: DateTime
        attributes:
          - "@default(now())"
      updatedAt:
        type: DateTime
        attributes:
          - "@updatedAt"
`;
      await fs.writeFile(modelsPath, content);
    }
  }
}
