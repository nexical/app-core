import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { globby } from 'globby';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function generateEnv() {
  const envPath = path.join(rootDir, '.env');

  if (fs.existsSync(envPath)) {
    console.log('ℹ️  .env file already exists. Skipping generation.');
    return;
  }

  console.log('🚀 Generating .env file...');

  let envContent = '';

  // 1. Read root .env.example
  const rootEnvExamplePath = path.join(rootDir, '.env.example');
  if (fs.existsSync(rootEnvExamplePath)) {
    console.log('   - Reading root .env.example');
    envContent += fs.readFileSync(rootEnvExamplePath, 'utf-8');
    envContent += '\n';
  } else {
    console.warn('⚠️  Root .env.example not found.');
  }

  // 2. Find and read module .env.example files
  const moduleEnvExamples = await globby('modules/*/.env.example', {
    cwd: rootDir,
    absolute: true,
  });

  for (const moduleEnvPath of moduleEnvExamples) {
    const relativePath = path.relative(rootDir, moduleEnvPath);
    console.log(`   - Reading ${relativePath}`);

    envContent += `\n# --- ${relativePath} ---\n`;
    envContent += fs.readFileSync(moduleEnvPath, 'utf-8');
    envContent += '\n';
  }

  // 3. Write to .env
  fs.writeFileSync(envPath, envContent.trim() + '\n');
  console.log('✅ .env file created successfully.');
}

generateEnv().catch((error) => {
  console.error('❌ Error generating .env file:', error);
  process.exit(1);
});
