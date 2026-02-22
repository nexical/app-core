import { HookSystem } from '@/lib/modules/hooks';

/**
 * TEMPLATE: Security Data Filter
 *
 * Instructions:
 * 1. Use filters to sanitize data before it leaves the module.
 * 2. Place this file in `src/hooks/`. It will be auto-discovered by the generated `server-init.ts`.
 * 3. Use `unknown` and type-guards/casting to ensure type safety.
 *
 * CRITICAL: NEVER import 'db' in a hook. Use Services for data lookups.
 * CRITICAL: NEVER use 'process.env' directly. Use module configuration.
 */
export class SecurityFilters {
  static init() {
    // Filter data before it's returned by a service or API
    // Replace __MODULE__.__ENTITY__.read with your specific hook name (e.g., 'user.read')
    HookSystem.filter('__MODULE__.__ENTITY__.read', async (data: unknown) => {
      if (!data || typeof data !== 'object') return data;

      // Mask or remove sensitive fields
      const sanitized = { ...(data as Record<string, unknown>) };

      // Example of stripping sensitive fields
      delete sanitized.secretKey;
      delete sanitized.internalMetadata;

      // Example: Masking an email
      if (sanitized.email && typeof sanitized.email === 'string') {
        const [user, domain] = sanitized.email.split('@');
        sanitized.email = `${user[0]}***@${domain}`;
      }

      return sanitized;
    });
  }
}
