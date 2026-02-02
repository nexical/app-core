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
      .replace(/['`]/g, '"')
      .replace(/import\(.*?\)\./g, '');
  }

  /**
   * Normalizes a module specifier for comparison.
   * 1. Removes extensions (.ts, .js, etc.)
   * 2. Strips /index
   * 3. Standardizes SDK subpaths
   */
  static normalizeImport(specifier: string): string {
    if (!specifier) return '';

    // 1. Remove quotes if present
    let normalized = specifier.replace(/['"]/g, '');

    // 2. Remove extensions
    normalized = normalized.replace(/\.(ts|js|mjs|cjs)$/, '');

    // 3. Strip /index
    normalized = normalized.replace(/\/index$/, '');

    // 4. Standardize legacy mappings
    const legacyMapping: Record<string, string> = {
      '@/lib/api-docs': '@/lib/api/api-docs',
      '@/lib/api-guard': '@/lib/api/api-guard',
      '@/lib/hooks': '@/lib/modules/hooks',
      '@/lib/api-query': '@/lib/api/api-query',
      '@/lib/utils': '@/lib/core/utils',
      '@/lib/db': '@/lib/core/db',
    };
    normalized = legacyMapping[normalized] || normalized;

    // 5. Standardize SDK subpaths to canonical SDK root
    if (normalized.includes('/src/sdk/')) {
      normalized = normalized.split('/src/sdk/')[0] + '/src/sdk';
    }

    return normalized;
  }
}
