#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
    .name('arc')
    .description('ArcNexus Generator CLI')
    .version('0.0.1');

// Dynamic Command Loading
async function registerCommands() {
    const commandsDir = path.join(__dirname, 'commands');

    // Recursive function to find command files
    async function scanDir(dir: string) {
        if (!fs.existsSync(dir)) return;

        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                await scanDir(fullPath);
            } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js')) && entry.name !== 'base.ts' && !entry.name.endsWith('.d.ts')) {
                try {
                    const module = await import(fullPath);
                    // Assumes the command class is the default export
                    if (module.default && typeof module.default === 'function') {
                        const commandInstance = new module.default();
                        if (commandInstance.getCommand) {
                            program.addCommand(commandInstance.getCommand());
                        }
                    }
                } catch (error) {
                    console.error(chalk.red(`Failed to load command from ${entry.name}:`), error);
                }
            }
        }
    }

    await scanDir(commandsDir);
}

async function main() {
    try {
        await registerCommands();
        await program.parseAsync(process.argv);
    } catch (error) {
        console.error(chalk.red('Unexpected error:'), error);
        process.exit(1);
    }
}

main();
