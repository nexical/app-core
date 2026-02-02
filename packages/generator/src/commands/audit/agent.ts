import { BaseCommand } from '../base.js';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { z } from 'zod';
import { ModuleLocator } from '../../lib/module-locator.js';

// Zod schema for agents.yaml validation
const AgentConfigSchema = z.object({
  name: z.string(),
  type: z.enum(['job', 'persistent']),
  description: z.string().optional(),
  jobType: z.string().optional(), // Required for 'job' type
  schema: z.string().optional(), // Zod schema name for validation
});

const AgentsYamlSchema = z.object({
  agents: z.array(AgentConfigSchema),
});

interface ValidationResult {
  moduleName: string;
  errors: string[];
  warnings: string[];
  agents: string[];
}

export default class AuditAgentCommand extends BaseCommand {
  constructor() {
    super({
      name: 'audit:agent',
      description: 'Audit agent definitions in agents.yaml',
      args: {
        '[name]': 'The name of the module (or glob pattern) to audit. Defaults to "*-api".',
      },
      options: {
        '--schema': 'Validate agents.yaml schemas only (no code audit)',
        '--verbose': 'Show detailed output',
      },
      helpMetadata: {
        examples: [
          '$ arc audit:agent',
          '$ arc audit:agent orchestrator-api',
          '$ arc audit:agent "*-api" --schema',
        ],
      },
    });
  }

  async run(name: string | undefined, options: { schema?: boolean; verbose?: boolean }) {
    const pattern = name || '*-api';
    const modules = await ModuleLocator.expand(pattern);

    if (modules.length === 0) {
      console.info(chalk.yellow(`No modules found matching pattern "${pattern}"`));
      return;
    }

    console.info(chalk.blue(`Auditing ${modules.length} module(s) for agent definitions...`));

    const results: ValidationResult[] = [];

    for (const moduleName of modules) {
      const result = await this.auditModule(moduleName, options);
      if (result) results.push(result);
    }

    // Summary
    this.printSummary(results);
  }

  private async auditModule(
    moduleName: string,
    options: { schema?: boolean; verbose?: boolean },
  ): Promise<ValidationResult | null> {
    const moduleDir = path.join(process.cwd(), 'modules', moduleName);
    const agentsYamlPath = path.join(moduleDir, 'agents.yaml');

    // Check if agents.yaml exists
    if (!fs.existsSync(agentsYamlPath)) {
      if (options.verbose) {
        console.info(chalk.gray(`  ${moduleName}: No agents.yaml found`));
      }
      return null;
    }

    const spinner = ora(`Auditing ${moduleName}`).start();
    const result: ValidationResult = {
      moduleName,
      errors: [],
      warnings: [],
      agents: [],
    };

    try {
      // Parse YAML
      const content = fs.readFileSync(agentsYamlPath, 'utf-8');
      const parsed = YAML.parse(content);

      // Schema validation
      const schemaResult = AgentsYamlSchema.safeParse(parsed);
      if (!schemaResult.success) {
        for (const error of schemaResult.error.errors) {
          result.errors.push(`Schema: ${error.path.join('.')} - ${error.message}`);
        }
        spinner.fail(chalk.red(`${moduleName}: Schema validation failed`));
        return result;
      }

      const agentsConfig = schemaResult.data;
      result.agents = agentsConfig.agents.map((a) => a.name);

      // If schema-only mode, we're done
      if (options.schema) {
        spinner.succeed(
          chalk.green(`${moduleName}: Schema valid (${result.agents.length} agents)`),
        );
        return result;
      }

      // Code audit: Check if generated files exist
      for (const agent of agentsConfig.agents) {
        const agentFilePath = path.join(moduleDir, 'src', 'agent', `${agent.name}.ts`);

        if (!fs.existsSync(agentFilePath)) {
          result.warnings.push(
            `Missing: src/agent/${agent.name}.ts (run 'arc gen:api ${moduleName}')`,
          );
        } else {
          // Check if file has required structure
          const fileContent = fs.readFileSync(agentFilePath, 'utf-8');

          if (agent.type === 'job') {
            if (!fileContent.includes('JobProcessor')) {
              result.errors.push(`${agent.name}: Missing JobProcessor base class`);
            }
            if (!fileContent.includes(`jobType`)) {
              result.errors.push(`${agent.name}: Missing jobType property`);
            }
            if (!fileContent.includes(`process(`)) {
              result.errors.push(`${agent.name}: Missing process() method`);
            }
          } else if (agent.type === 'persistent') {
            if (!fileContent.includes('PersistentAgent')) {
              result.errors.push(`${agent.name}: Missing PersistentAgent base class`);
            }
            if (!fileContent.includes(`run(`)) {
              result.errors.push(`${agent.name}: Missing run() method`);
            }
          }
        }
      }

      // Report
      if (result.errors.length > 0) {
        spinner.fail(chalk.red(`${moduleName}: ${result.errors.length} error(s)`));
      } else if (result.warnings.length > 0) {
        spinner.warn(chalk.yellow(`${moduleName}: ${result.warnings.length} warning(s)`));
      } else {
        spinner.succeed(chalk.green(`${moduleName}: All ${result.agents.length} agents valid`));
      }

      return result;
    } catch (error) {
      spinner.fail(chalk.red(`${moduleName}: Parse error`));
      result.errors.push(`Parse error: ${error instanceof Error ? error.message : String(error)}`);
      return result;
    }
  }

  private printSummary(results: ValidationResult[]) {
    console.info('');
    console.info(chalk.bold('Summary:'));

    const totalAgents = results.reduce((sum, r) => sum + r.agents.length, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

    console.info(`  Modules: ${results.length}`);
    console.info(`  Agents: ${totalAgents}`);
    console.info(`  Errors: ${totalErrors > 0 ? chalk.red(totalErrors) : chalk.green('0')}`);
    console.info(
      `  Warnings: ${totalWarnings > 0 ? chalk.yellow(totalWarnings) : chalk.green('0')}`,
    );

    // Detail errors
    for (const result of results) {
      if (result.errors.length > 0 || result.warnings.length > 0) {
        console.info('');
        console.info(chalk.bold(`${result.moduleName}:`));
        for (const error of result.errors) {
          console.info(chalk.red(`  ✗ ${error}`));
        }
        for (const warning of result.warnings) {
          console.info(chalk.yellow(`  ⚠ ${warning}`));
        }
      }
    }
  }
}
