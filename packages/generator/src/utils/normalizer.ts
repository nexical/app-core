export class Normalizer {
  /**
   * Normalizes code string for permissive comparison.
   * 1. Replaces usage of ' and ` with "
   * 2. Collapses multiple whitespace to single space
   * 3. Trims
   */
  static normalize(code: string): string {
    if (!code) return '';
    return code
      .replace(/['`]/g, '"')
      .replace(/\s+/g, ' ')
      .replace(/\{\s+/g, '{')
      .replace(/\s+\}/g, '}')
      .trim();
  }

  /**
   * Normalizes a TypeScript type string for comparison.
   * 1. Removes all whitespace
   * 2. Replaces delimiters (, ;) with nothing
   * 3. Removes import(...) qualifiers
   */
  static normalizeType(type: string): string {
    if (!type) return '';
    return type
      .replace(/\s/g, '')
      .replace(/[;,]/g, '')
      .replace(/import\(.*?\)\./g, '');
  }
}
