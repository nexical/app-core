import { readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ts, type ParsedStatement } from '../engine/primitives/statements/factory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class TemplateLoader {
  private static templatesDir = resolve(__dirname, '../../templates');

  static load(path: string, variables: Record<string, string> = {}): ParsedStatement {
    const fullPath = join(this.templatesDir, path);
    const fileContent = readFileSync(fullPath, 'utf-8');

    // Regex to capture content inside: export default fragment`...`;
    // Supports optional /* ts */ comment
    // Matches nested backticks? No, regex is limited for nested backticks but sufficient for basic fragments.
    // Ideally we match until the last backtick that closes the string.
    const regex = /export\s+default\s+fragment(?:\/\*\s*ts\s*\*\/\s*)?`([\s\S]*)`;?\s*$/;

    // Note: If using multiple named exports in one file was the previous plan, the user has now requested
    // "Separate out each fragment into its own file... only one fragment per file"
    // and "Iterate through existing files... wrap their content in Strict Fragment Pattern... export default fragment".

    const match = fileContent.match(regex);
    if (!match) {
      throw new Error(`Invalid template format in ${path}. Must export default fragment\`...\``);
    }

    let innerContent = match[1].trim();

    // Unescape backticks (since we captured raw text from file, and they are escaped in the source to be valid JS)
    innerContent = innerContent.replace(/\\`/g, '`').replace(/\\\${/g, '${');

    // Variable interpolation
    for (const [key, value] of Object.entries(variables)) {
      // Replace ${key} with value
      innerContent = innerContent.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
    }

    // Call ts with the interpolated string
    const substrings = [innerContent];
    (substrings as unknown as { raw: string[] }).raw = [innerContent];

    return ts(substrings as unknown as TemplateStringsArray);
  }
}
