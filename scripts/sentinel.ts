import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { globby } from 'globby';

const PROTECTED_PATHS = [
    'src',
    'tests',
    'public',
    'prisma/models.yaml',
    'prisma/seed.ts',
    'locales',
    'packages',
    'prompts',
    'scripts',
    'tsconfig.json',
    'package.json',
    'astro.config.mjs',
    'prisma.config.ts',
    'vitest.unit.config.ts',
    'vitest.agent.config.ts',
    'vitest.integration.config.ts',
    'playwright.config.ts',
    'Dockerfile',
    'docker',
    'compose.db.yml',
    'compose.yml',
    '.dockerignore',
    '.gitignore',
    '.env.example',
    '.husky',
    '.vscode',
    'README.md',
    'ARCHITECTURE.md',
    'CODE.md',
    'THEME.md',
    'MODULES.md',
    'GEMINI.md',
    'LICENSE',
];
const LOCK_FILE = 'core.lock.json';

interface LockFile {
    [filePath: string]: string;
}

async function calculateHash(filePath: string): Promise<string> {
    const content = await fs.promises.readFile(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
}

async function getProtectedFiles(): Promise<string[]> {
    const files = await globby(PROTECTED_PATHS, {
        gitignore: true,
    });
    return files.sort();
}

async function check(): Promise<void> {
    console.log('🔍 Verifying core architecture integrity...');

    if (!fs.existsSync(LOCK_FILE)) {
        console.error('❌ Lock file not found. Run "npm run core:accept" to initialize.');
        process.exit(1);
    }

    const lockFileContent = await fs.promises.readFile(LOCK_FILE, 'utf-8');
    const lockData: LockFile = JSON.parse(lockFileContent);

    const currentFiles = await getProtectedFiles();
    const inconsistencies: string[] = [];

    // Check for modifications and new files
    for (const file of currentFiles) {
        const hash = await calculateHash(file);
        if (!lockData[file]) {
            inconsistencies.push(`XML [NEW] ${file}`);
        } else if (lockData[file] !== hash) {
            inconsistencies.push(`[MODIFIED] ${file}`);
        }
    }

    // Check for deleted files
    for (const file of Object.keys(lockData)) {
        if (!currentFiles.includes(file)) {
            inconsistencies.push(`[DELETED] ${file}`);
        }
    }

    if (inconsistencies.length > 0) {
        console.error('\n❌ Refusing to proceed. Core files have changed:');
        inconsistencies.forEach((msg) => console.error(`  ${msg}`)); // Red color logic can be added if needed, but simple console.error is reddish in many terminals or just plain text is fine for now as per req "Log in RED" - I'll stick to standard output for now but could use ansi codes.
        // Let's use ANSI codes for Red as requested.
        console.error('\n\x1b[31mRefusing to proceed. Core files have changed.\x1b[0m');
        console.error('Run \x1b[1mnpm run core:accept\x1b[0m to approve these changes.');
        process.exit(1);
    }

    console.log('✅ Core integrity verified.');
}

async function accept(): Promise<void> {
    console.log('🔒 Locking core architecture state...');

    const currentFiles = await getProtectedFiles();
    const lockData: LockFile = {};

    for (const file of currentFiles) {
        lockData[file] = await calculateHash(file);
    }

    await fs.promises.writeFile(LOCK_FILE, JSON.stringify(lockData, null, 2) + '\n');
    console.log('✅ Core changes accepted and locked.');
}

async function main() {
    const mode = process.argv[2];

    if (mode === 'check') {
        await check();
    } else if (mode === 'accept') {
        await accept();
    } else {
        console.error('Usage: sentinel.ts <check|accept>');
        process.exit(1);
    }
}

main().catch((err) => {
    console.error('An unexpected error occurred:', err);
    process.exit(1);
});
