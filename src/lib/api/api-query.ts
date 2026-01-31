import type { OpenAPIParameter } from './api-docs';
export type FilterFieldType = 'string' | 'number' | 'boolean' | 'date' | 'enum';

export interface FilterOptions {
  fields: Record<string, FilterFieldType>;
  defaults?: Record<string, any>;
  searchFields?: readonly string[];
}

export interface FilterErrorDetail {
  type: 'INVALID_FIELD' | 'INVALID_OPERATOR';
  field: string;
  received: string;
  message: string;
  suggestions?: string[];
  allowed?: string[];
}

export class InvalidFilterError extends Error {
  constructor(public details: FilterErrorDetail[]) {
    super('Invalid filters provided');
    this.name = 'InvalidFilterError';
  }
}

const OPERATORS_BY_TYPE: Record<FilterFieldType, string[]> = {
  string: ['eq', 'ne', 'contains', 'startsWith', 'endsWith', 'in'],
  number: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in'],
  date: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in'],
  boolean: ['eq', 'ne', 'in'],
  enum: ['eq', 'ne', 'in'],
};

export function parseQuery<T = unknown>(
  searchParams: URLSearchParams,
  options: FilterOptions,
): { where: T; take: number; skip: number; orderBy?: Record<string, 'asc' | 'desc'> } {
  const where: Record<string, unknown> = {};
  const errors: FilterErrorDetail[] = [];

  // Initialize defaults
  let take = options.defaults?.take || 50;
  let skip = options.defaults?.skip || 0;
  let orderBy: Record<string, 'asc' | 'desc'> | undefined = options.defaults?.orderBy;

  // Handle Top-Level Params
  if (searchParams.has('take')) {
    const t = parseInt(searchParams.get('take') || '');
    if (!isNaN(t)) take = t;
  }
  if (searchParams.has('skip')) {
    const s = parseInt(searchParams.get('skip') || '');
    if (!isNaN(s)) skip = s;
  }

  // Handle OrderBy (format: field:asc or field:desc or just field)
  if (searchParams.has('orderBy')) {
    const val = searchParams.get('orderBy') || '';
    if (val.includes(':')) {
      const [field, dir] = val.split(':');
      orderBy = { [field]: dir.toLowerCase() === 'desc' ? 'desc' : 'asc' };
    } else {
      orderBy = { [val]: 'asc' };
    }
  }

  // Handle Search
  const search = searchParams.get('search');
  if (search && options.searchFields && options.searchFields.length > 0) {
    where['OR'] = options.searchFields.map((field) => {
      // Check if field is numeric or string in definition to decide operator?
      // For now, simplicity: if the underlying field in Prisma is string, use contains/insensitive
      // If it's an ID/uuid (string), use equals.
      // As a convention in this codebase, 'search' is fuzzy text search.
      // But sometimes we want exact match for IDs.
      // Let's rely on the fact that if a user puts an ID in search, they might want exact match or partial.
      // Usually search is 'contains', 'mode: insensitive'.
      return {
        [field]: { contains: search, mode: 'insensitive' },
      };
    });
  }

  const allowedFields = Object.keys(options.fields);

  for (const [key, value] of searchParams.entries()) {
    if (['take', 'skip', 'search'].includes(key)) continue;

    let field: string;
    let operator: string;
    const hasDot = key.includes('.');

    if (hasDot) {
      const lastDotIndex = key.lastIndexOf('.');
      field = key.substring(0, lastDotIndex);
      operator = key.substring(lastDotIndex + 1);
    } else {
      field = key;
      operator = 'eq';
    }

    // 1. Validate Field
    const fieldType = options.fields[field];
    if (!fieldType) {
      if (hasDot) {
        // strictly validate dotted fields
        const suggestions = findClosestMatch(field, allowedFields);
        errors.push({
          type: 'INVALID_FIELD',
          field,
          received: field,
          message: `Field '${field}' is not allowed.${suggestions.length ? ` Did you mean '${suggestions[0]}'?` : ''}`,
          suggestions,
          allowed: allowedFields,
        });
      }
      continue;
    }

    // 2. Validate Operator
    const allowedOperators = OPERATORS_BY_TYPE[fieldType];
    if (!allowedOperators.includes(operator)) {
      errors.push({
        type: 'INVALID_OPERATOR',
        field,
        received: operator,
        message: `Operator '${operator}' is not allowed for field '${field}' (${fieldType}).`,
        allowed: allowedOperators,
      });
      continue;
    }

    if (!where[field]) {
      where[field] = {};
    }
    const fieldFilter = where[field] as Record<string, unknown>;

    // Map operator to Prisma
    switch (operator) {
      case 'eq':
        where[field] =
          fieldType === 'boolean'
            ? parseBoolean(value)
            : fieldType === 'number'
              ? Number(value)
              : value;
        break;
      case 'ne':
        fieldFilter['not'] =
          fieldType === 'boolean'
            ? parseBoolean(value)
            : fieldType === 'number'
              ? Number(value)
              : value;
        break;
      case 'contains':
        fieldFilter['contains'] = value;
        fieldFilter['mode'] = 'insensitive';
        break;
      case 'gt':
        fieldFilter['gt'] = parseValue(value, fieldType);
        break;
      case 'gte':
        fieldFilter['gte'] = parseValue(value, fieldType);
        break;
      case 'lt':
        fieldFilter['lt'] = parseValue(value, fieldType);
        break;
      case 'lte':
        fieldFilter['lte'] = parseValue(value, fieldType);
        break;
      case 'startsWith':
        fieldFilter['startsWith'] = value;
        break;
      case 'endsWith':
        fieldFilter['endsWith'] = value;
        break;
      case 'in':
        fieldFilter['in'] = value.split(',').map((v) => parseValue(v, fieldType));
        break;
    }
  }

  // Merge other defaults into where if not present
  if (options.defaults) {
    for (const [k, v] of Object.entries(options.defaults)) {
      if (k !== 'take' && k !== 'skip' && k !== 'orderBy' && where[k] === undefined) {
        where[k] = v;
      }
    }
  }

  if (errors.length > 0) {
    throw new InvalidFilterError(errors);
  }

  return { where: where as T, take, skip, orderBy };
}

function parseBoolean(val: string): boolean {
  return val === 'true';
}

function parseValue(val: string, type: FilterFieldType): string | number | boolean {
  if (type === 'number') {
    const num = Number(val);
    return isNaN(num) ? (undefined as unknown as number) : num; // undefined isn't number, so we might need return type adjustment or ignore if undefined is filtered out upstream
  }
  if (type === 'boolean') {
    return val === 'true';
  }
  return val;
}

/**
 * Valid operators for a specific type.
 */
export function getAllowedOperators(type: FilterFieldType): string[] {
  return OPERATORS_BY_TYPE[type] || [];
}

/**
 * Generates OpenAPI parameters.
 */
export function generateFilterDocs(options: FilterOptions): OpenAPIParameter[] {
  const parameters: OpenAPIParameter[] = [];

  for (const [field, type] of Object.entries(options.fields)) {
    const operators = OPERATORS_BY_TYPE[type] || [];
    for (const op of operators) {
      parameters.push({
        name: `${field}.${op}`,
        in: 'query',
        description: `Filter by ${field} (${op})`,
        required: false,
        schema: { type: type === 'number' ? 'number' : type === 'boolean' ? 'boolean' : 'string' },
      });
    }
  }
  return parameters;
}

// --- Levenshtein / Fuzzy Matching ---

function findClosestMatch(input: string, candidates: string[]): string[] {
  const distances = candidates.map((candidate) => ({
    candidate,
    distance: levenshtein(input, candidate),
  }));

  // Sort by distance
  distances.sort((a, b) => a.distance - b.distance);

  // Filter: only suggest if distance is reasonably small (e.g. <= 3 or 30% of length)
  // For short strings like 'role', distance 2 is high. For 'username', 2 is fine.
  // Heuristic: distance <= 2 is usually a good cutoff for typos.

  return distances
    .filter((d) => d.distance <= 2)
    .map((d) => d.candidate)
    .slice(0, 3); // Top 3
}

function levenshtein(a: string, b: string): number {
  const matrix = [];

  // Increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // Increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1, // deletion
          ),
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
