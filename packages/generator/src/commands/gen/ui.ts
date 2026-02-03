import { BaseCommand } from '../base.js';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { UiModuleGenerator } from '../../engine/ui-module-generator.js';

export default class GenUiCommand extends BaseCommand {
  constructor() {
    super({
      name: 'gen:ui',
      description: 'Generate UI module code from ui.yaml',
      args: {
        '[name]': 'The name of the module to generate.',
      },
      helpMetadata: {
        examples: ['$ arc gen:ui user-ui'],
      },
    });
  }

  async run(name: string) {
    if (!name) {
      console.error(chalk.red('Module name is required'));
      return;
    }

    console.info(chalk.magenta(`\nGenerating UI code for module: ${name}`));
    const moduleDir = path.join(process.cwd(), 'modules', name);

    try {
      if (!fs.existsSync(moduleDir)) {
        console.error(chalk.red(`Module directory '${moduleDir}' does not exist.`));
        return;
      }

      // 1. Run Generator
      const generator = new UiModuleGenerator(moduleDir);
      await generator.run();

      console.info(chalk.green(`Successfully generated UI code for "${name}"`));
    } catch (error) {
      console.error(error);
      console.info(chalk.red('Failed to generate UI code'));
      throw error;
    }
  }
}
