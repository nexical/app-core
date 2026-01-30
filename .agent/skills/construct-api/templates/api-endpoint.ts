/**
 * ESCAPE HATCH / REFERENCE ONLY
 *
 * CRITICAL: Standard API routes are STRICTLY GENERATED from api.yaml.
 * Use this manual template ONLY if the generator cannot support your specific use case.
 *
 * Location: src/pages/api/custom/__name__.ts
 */
import { defineApi } from '@/lib/api/api-docs';
import { ApiGuard } from '@/lib/api/api-guard';
import { HookSystem } from '@/lib/modules/hooks';
import { __ServiceName__ } from '../../services/__model__-service';

export const POST = defineApi(
  async (context) => {
    // 1. Parse Inputs
    const body = await context.request.json().catch(() => ({}));
    const query = Object.fromEntries(new URL(context.request.url).searchParams);

    // 2. Hook: Filter Input
    const input = await HookSystem.filter('__module__.__resource__.input', body);

    // 3. Security (Uses Role Policies)
    // CRITICAL: Merge params, query, and body for the security check
    const combinedInput = { ...context.params, ...query, ...input };
    await ApiGuard.protect(context, '__role__', combinedInput);

    // 4. Execution (Service or Action)
    const result = await __ServiceName__.create(combinedInput);

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), { status: 400 });
    }

    // 5. Hook: Filter Output
    const output = await HookSystem.filter('__module__.__resource__.output', result.data);

    return output;
  },
  {
    summary: 'Custom Resource Operation',
    tags: ['__Module__'],
    description: 'Manual escape hatch for custom logic that falls outside standard CRUD.',
  },
);
