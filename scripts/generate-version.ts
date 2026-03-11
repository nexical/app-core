import * as fs from 'fs';
import * as path from 'path';

const APP_ROOT = process.cwd();
// We assume this script is run from apps/backend or apps/frontend, so the root is 2 levels up
const PROJECT_ROOT = path.resolve(APP_ROOT, '../../');
const VERSION_FILE_PATH = path.join(PROJECT_ROOT, 'VERSION');
const TARGET_FILE_PATH = path.join(APP_ROOT, 'src/lib/core/version.ts');

if (!fs.existsSync(VERSION_FILE_PATH)) {
  console.error(`VERSION file not found at ${VERSION_FILE_PATH}`);
  process.exit(1);
}

const version = fs.readFileSync(VERSION_FILE_PATH, 'utf-8').trim();
const content = `// This file is auto-generated. Do not edit directly.
export const APP_VERSION = '${version}';
`;

// Ensure directory exists
const targetDir = path.dirname(TARGET_FILE_PATH);
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

fs.writeFileSync(TARGET_FILE_PATH, content);
console.log(`Generated ${TARGET_FILE_PATH} with version ${version}`);
