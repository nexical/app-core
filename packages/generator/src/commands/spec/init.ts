import { BaseCommand } from '../base.js';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { AgentRunner } from '../../utils/agent-runner.js';

export class SpecInitCommand extends BaseCommand {
  constructor() {
    super({
      name: 'spec:init',
      description: 'Interactively generate a specification for a new module',
      args: {
        name: 'The name of the new module (e.g., "payment-api")',
      },
      helpMetadata: {
        examples: ['$ nexical spec:init payment-api'],
      },
    });
  }

  async run(name: string) {
    if (!name) {
      console.error(chalk.red('Please provide a module name.'));
      return;
    }

    const modulePath = path.join(process.cwd(), 'modules', name);
    const specFile = path.join(modulePath, 'SPECIFICATION.md');

    if (await fs.pathExists(modulePath)) {
      console.warn(
        chalk.yellow(
          `Module "${name}" already exists. You might want to use "spec:update" instead.`,
        ),
      );
      // prompt to continue? For now, we proceed but warn.
    } else {
      console.info(chalk.blue(`Creating module directory: ${modulePath}`));
      await fs.ensureDir(modulePath);
    }

    if (!(await fs.pathExists(specFile))) {
      await fs.writeFile(specFile, `# Module Specification: ${name}\n\n(Draft)`);
    }

    console.info(chalk.green(`\nStarting interactive specification session for "${name}"...\n`));

    try {
      AgentRunner.run(
        'SpecWriter',
        'prompts/agents/spec-writer.md',
        {
          module_root: modulePath,
          spec_file: specFile,
          user_input: `I want to create a new module named "${name}". Please interview me to build the specification.`,
        },
        true,
      );
    } catch {
      process.exit(1);
    }
  }
}
