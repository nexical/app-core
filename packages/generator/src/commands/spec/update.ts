import { BaseCommand } from '../base.js';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { AgentRunner } from '../../utils/agent-runner.js';

export class SpecUpdateCommand extends BaseCommand {
  constructor() {
    super({
      name: 'spec:update',
      description: 'Update or reverse-engineer a specification for an existing module',
      args: {
        name: 'The name of the module to update (e.g., "payment-api")',
      },
      helpMetadata: {
        examples: ['$ nexical spec:update payment-api'],
      },
    });
  }

  async run(name: string) {
    if (!name) {
      console.error(chalk.red('Please provide a module name.'));
      return;
    }

    // Try to find module using locator or simple path
    // ModuleLocator.expand returns names, not paths usually?
    // Let's assume standard path for now or check.
    const modulePath = path.join(process.cwd(), 'modules', name);

    if (!(await fs.pathExists(modulePath))) {
      console.error(chalk.red(`Module "${name}" not found at ${modulePath}.`));
      return;
    }

    const specFile = path.join(modulePath, 'SPECIFICATION.md');

    if (!(await fs.pathExists(specFile))) {
      console.info(
        chalk.yellow(`SPECIFICATION.md not found. Creating a placeholder to be filled.`),
      );
      await fs.writeFile(
        specFile,
        `# Module Specification: ${name}\n\n(Draft generated from code)`,
      );
    }

    console.info(chalk.green(`\nStarting interactive specification update for "${name}"...\n`));

    try {
      AgentRunner.run(
        'SpecWriter',
        'prompts/agents/spec-writer.md',
        {
          module_root: modulePath,
          spec_file: specFile,
          user_input: `I want to update the specification for "${name}" based on the current code and my input. Please read the code and interview me.`,
        },
        true,
      );
    } catch {
      process.exit(1);
    }
  }
}
