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
import { __ActionName__Action } from '../../../actions/__kebab-case__-__group__';

export const POST = defineApi(
  async (context) => {
    // 1. Parse Inputs (Merge params, query, and body)
    const body = await context.request.json().catch(() => ({}));
    const query = Object.fromEntries(new URL(context.request.url).searchParams);
    const rawInput = { ...context.params, ...query, ...body };

    // 2. Hook: Filter Input
    const input = await HookSystem.filter('__module__.__resource__.input', rawInput);

    // 3. Security (Uses Role Policies)
    // CRITICAL: Merge params, query, and body for the security check
    await ApiGuard.protect(context, '__role__', input);

    // 4. Execution (Action-Service-Gateway Split)
    // RULE: API endpoints MUST call Actions for business logic orchestration.
    const result = await __ActionName__Action.run(input, context);

    // 5. Hook: Filter Output
    const filteredResult = await HookSystem.filter('__module__.__resource__.output', result);

    // 6. Response
    // Align with ServiceResponse usage and standardized error handling.
    if (!filteredResult.success) {
      return new Response(JSON.stringify(filteredResult), {
        status: filteredResult.status || 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return filteredResult;
  },
  {
    summary: 'Custom Resource Operation',
    tags: ['__Module__'],
    description: 'Manual escape hatch for custom logic that falls outside standard CRUD.',
  },
);
