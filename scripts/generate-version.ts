import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function getPackageVersion(): string {
  try {
    const packageJsonPath = path.join(rootDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.version || '0.0.0';
  } catch (error) {
    console.warn('⚠️  Could not read package.json version:', error);
    return '0.0.0';
  }
}

function getVersionFileContent(): string | null {
  try {
    const versionFilePath = path.join(rootDir, 'VERSION');
    if (fs.existsSync(versionFilePath)) {
      return fs.readFileSync(versionFilePath, 'utf-8').trim();
    }
  } catch (error) {
    console.warn('⚠️  Error reading VERSION file:', error);
  }
  return null;
}

async function generateVersion() {
  console.info('🚀 Generating version file...');

  const packageVersion = getPackageVersion();
  const versionFileContent = getVersionFileContent();

  // Priority: VERSION file > package.json
  const appVersion = versionFileContent || packageVersion;

  console.info(
    `   - Detected version: ${appVersion} (Source: ${versionFileContent ? 'VERSION file' : 'package.json'})`,
  );

  const versionFilePath = path.join(rootDir, 'src/lib/core/version.ts');
  const content = `// This file is auto-generated. Do not edit.
export const APP_VERSION = "${appVersion}";
`;

  fs.writeFileSync(versionFilePath, content);
  console.info(`✅ Generated ${versionFilePath}`);
}

generateVersion().catch((error) => {
  console.error('❌ Error generating version file:', error);
  process.exit(1);
});
