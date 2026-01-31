import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const REPO_ROOT = path.resolve(__dirname, '../..');
const MODULES_DIR = path.resolve(REPO_ROOT, 'modules');
const DOCS_CONTENT_DIR = path.resolve(__dirname, '../src/content/docs');
const MODULES_OUT_DIR = path.join(DOCS_CONTENT_DIR, 'modules');
const SIDEBAR_FILE = path.resolve(__dirname, '../src/sidebar-modules.json');

console.info(`Scanning modules in: ${MODULES_DIR}`);

if (!fs.existsSync(MODULES_DIR)) {
  console.error('Modules directory not found!');
  process.exit(1);
}

// Ensure output directory exists and is clean
if (fs.existsSync(MODULES_OUT_DIR)) {
  fs.rmSync(MODULES_OUT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(MODULES_OUT_DIR, { recursive: true });

const modules = fs.readdirSync(MODULES_DIR).filter((name) => {
  return fs.statSync(path.join(MODULES_DIR, name)).isDirectory();
});

interface SidebarEntry {
  label: string;
  autogenerate?: { directory: string };
  link?: string;
}

const sidebarEntries: SidebarEntry[] = [];

console.info(`Found ${modules.length} modules.`);

for (const moduleName of modules) {
  const modulePath = path.join(MODULES_DIR, moduleName);
  const docsPath = path.join(modulePath, 'docs');
  const readmePath = path.join(modulePath, 'README.md');

  const hasDocs = fs.existsSync(docsPath);
  const hasReadme = fs.existsSync(readmePath);

  if (!hasDocs && !hasReadme) {
    continue;
  }

  console.info(`Processing ${moduleName}...`);

  if (hasDocs) {
    // Mode A: Full Module Documentation (Directory)
    const outDir = path.join(MODULES_OUT_DIR, moduleName);
    fs.mkdirSync(outDir, { recursive: true });

    // 1. Copy README as index.md if it exists
    if (hasReadme) {
      const readmeContent = fs.readFileSync(readmePath, 'utf8');
      let content = readmeContent;
      if (!content.trim().startsWith('---')) {
        content = `---
title: ${moduleName}
---

${readmeContent}`;
      }
      fs.writeFileSync(path.join(outDir, 'index.md'), content);
    }

    // 2. Copy docs/ contents recursively
    copyRecursive(docsPath, outDir);

    // 3. Generate Sidebar (Group)
    sidebarEntries.push({
      label: moduleName,
      autogenerate: { directory: `modules/${moduleName}` },
    });
  } else {
    // Mode B: Single File (README only)
    // Output at modules/{moduleName}.md
    const outFile = path.join(MODULES_OUT_DIR, `${moduleName}.md`);

    if (hasReadme) {
      const readmeContent = fs.readFileSync(readmePath, 'utf8');
      let content = readmeContent;
      if (!content.trim().startsWith('---')) {
        content = `---
title: ${moduleName}
---

${readmeContent}`;
      }
      fs.writeFileSync(outFile, content);

      // Generate Sidebar (Link)
      sidebarEntries.push({
        label: moduleName,
        link: `modules/${moduleName}`,
      });
    }
  }
}

// Write sidebar config
fs.writeFileSync(SIDEBAR_FILE, JSON.stringify(sidebarEntries, null, 2));

console.info('Documentation aggregation complete.');

function copyRecursive(src: string, dest: string) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}
