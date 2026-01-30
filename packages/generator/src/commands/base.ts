import { Command } from 'commander';
import { CustomHelp, type HelpSection } from '../lib/help.js';
import chalk from 'chalk';

export interface CommandOptions {
  name: string;
  description: string;
  args?: { [key: string]: string }; // name: description
  options?: { [flags: string]: string }; // flags: description
  helpMetadata?: {
    examples?: string[];
    troubleshooting?: string[];
  };
}

export abstract class BaseCommand {
  protected command: Command;

  constructor(protected config: CommandOptions) {
    this.command = new Command(config.name);
    this.command.description(config.description);
    this.configure();
  }

  private configure() {
    // Add arguments
    if (this.config.args) {
      Object.entries(this.config.args).forEach(([name, desc]) => {
        this.command.argument(name, desc);
      });
    }

    // Add options
    if (this.config.options) {
      Object.entries(this.config.options).forEach(([flags, desc]) => {
        this.command.option(flags, desc);
      });
    }

    // Custom Help
    this.command.configureHelp({
      formatHelp: (cmd, helper) => {
        const sections: HelpSection[] = [];

        if (this.config.helpMetadata?.examples) {
          sections.push({
            header: 'Examples',
            content: this.config.helpMetadata.examples.join('\n'),
          });
        }

        if (this.config.helpMetadata?.troubleshooting) {
          sections.push({
            header: 'Troubleshooting',
            content: this.config.helpMetadata.troubleshooting.join('\n'),
          });
        }

        return CustomHelp.format(cmd, sections);
      },
    });

    // Action Handler
    this.command.action(async (...args) => {
      try {
        await this.run(...args);
      } catch (error) {
        console.error(chalk.red('Command failed:'));
        if (error instanceof Error) {
          console.error(chalk.red(error.message));
          if (process.env.DEBUG) {
            console.error(chalk.dim(error.stack));
          }
        } else {
          console.error(chalk.red(String(error)));
        }
        process.exit(1);
      }
    });
  }

  public getCommand(): Command {
    return this.command;
  }

  // Abstract run method that must be implemented by subclasses
  abstract run(...args: any[]): Promise<void>;
}
