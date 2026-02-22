import { defineApi } from '@/lib/api/api-docs';
import { ApiGuard } from '@/lib/api/api-guard';
import { HookSystem } from '@/lib/modules/hooks';
import { CreateResourceAction } from '../../../actions/create-resource';

/**
 * MANUAL ESCAPE HATCH
 * Standard CRUD routes are strictly generated from api.yaml.
 * Use files in src/pages/api/custom/ for logic the generator cannot produce.
 */
export const POST = defineApi(
  async (context) => {
    // 1. Security (Role Policy)
    await ApiGuard.protect(context, 'member', { ...context.params });

    // 2. Input Filtering
    const body = await context.request.json();
    const input = await HookSystem.filter('resource.customInput', body);

    // 3. Action Execution
    const result = await CreateResourceAction.run(input, context);

    // 4. Output Filtering
    const output = await HookSystem.filter('resource.customOutput', result);

    return output;
  },
  {
    summary: 'Manual Endpoint Example',
    tags: ['Custom'],
  },
);
