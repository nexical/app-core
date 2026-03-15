import * as fs from 'fs';
import * as path from 'path';

const APP_ROOT = process.cwd();
const TARGET_FILE_PATH = path.join(APP_ROOT, 'src/lib/core/version.ts');

// Robust discovery of PROJECT_ROOT by searching for VERSION file upwards
let currentDir = APP_ROOT;
let versionFilePath = '';
const maxDepth = 5;
for (let i = 0; i < maxDepth; i++) {
  const checkPath = path.join(currentDir, 'VERSION');
  if (fs.existsSync(checkPath)) {
    versionFilePath = checkPath;
    break;
  }
  const parentDir = path.dirname(currentDir);
  if (parentDir === currentDir) break;
  currentDir = parentDir;
}

if (!versionFilePath) {
  console.error(`VERSION file not found in ${APP_ROOT} or its parents up to depth ${maxDepth}`);
  process.exit(1);
}

const VERSION_FILE_PATH = versionFilePath;

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
