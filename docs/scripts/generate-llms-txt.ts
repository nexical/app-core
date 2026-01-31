import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.resolve(__dirname, '../src/content/docs');
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const OUTPUT_SUMMARY = path.join(PUBLIC_DIR, 'llms.txt');
const OUTPUT_FULL = path.join(PUBLIC_DIR, 'llms-full.txt');

// Configurable Base URL
const BASE_URL = process.env.SITE_URL || 'http://localhost:4321';

console.info(`Generating AI context files...`);

if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// ... (helper function remains the same, omitted for brevity if I could, but replace_file_content needs contiguity or chunks)
// I will just replace the main loop part to be safe or use chunks.
// Let's replace the whole file content or a large chunk to be safe.

// Actually I'll use a chunk for the loop modification.

// Helper to recurse and get all md files
function getFiles(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      getFiles(path.join(dir, file), fileList);
    } else {
      if (file.endsWith('.md') || file.endsWith('.mdx')) {
        fileList.push(path.join(dir, file));
      }
    }
  }
  return fileList;
}

const allFiles = getFiles(CONTENT_DIR);

let summaryContent = `# Nexical Ecosystem Documentation\n\n`;
summaryContent += `> The SaaS Operating System for the AI Era.\n\n`;
summaryContent += `## Documentation Map\n\n`;

let fullContent = `# Nexical Ecosystem Documentation (Full)\n\n`;

// Sort files to ensure stable output, prioritizing key sections
const priority = ['index.mdx', 'architecture', 'modules', 'core-api', 'ui', 'guides'];
allFiles.sort((a, b) => {
  const relA = path.relative(CONTENT_DIR, a);
  const relB = path.relative(CONTENT_DIR, b);

  // Check priority
  const pA = priority.findIndex((p) => relA.startsWith(p));
  const pB = priority.findIndex((p) => relB.startsWith(p));

  if (pA !== -1 && pB !== -1) return pA - pB;
  if (pA !== -1) return -1;
  if (pB !== -1) return 1;

  return relA.localeCompare(relB);
});

for (const filePath of allFiles) {
  const relativePath = path.relative(CONTENT_DIR, filePath);
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract Front_matter title and description
  const titleMatch = content.match(/title:\s*(.*)/);
  const descMatch = content.match(/description:\s*(.*)/);

  const title = titleMatch ? titleMatch[1] : relativePath;
  const description = descMatch ? descMatch[1] : '';

  // Clean content for full text (remove frontmatter)
  const cleanContent = content.replace(/---[\s\S]*?---/, '').trim();

  // Url path construction (approximate Starlight routing)
  const urlPath = relativePath.replace(/\.(md|mdx)$/, '').replace(/index$/, '');
  const fullUrl = `${BASE_URL}/${urlPath}`.replace(/([^:]\/)\/+/g, '$1'); // Normalize slashes

  // Add to Summary
  summaryContent += `- [${title}](${fullUrl}): ${description}\n`;

  // Add to Full Content
  fullContent += `\n\n---\n\n`;
  fullContent += `# File: ${relativePath}\n`;
  fullContent += `# URL: ${fullUrl}\n\n`;
  fullContent += cleanContent;
}

// Add Footer to Summary
summaryContent += `\n\n## Full Documentation\n`;
summaryContent += `For the complete context, access [llms-full.txt](${BASE_URL}/llms-full.txt).\n`;

fs.writeFileSync(OUTPUT_SUMMARY, summaryContent);
fs.writeFileSync(OUTPUT_FULL, fullContent);

console.info(`Generated ${OUTPUT_SUMMARY} and ${OUTPUT_FULL}`);
