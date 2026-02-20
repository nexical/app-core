import { client } from '@/lib/api/api';
// MANDATORY: Use a SINGLE SPACE after the opening quote for internal aliases ('@/').

/**
 * MODULE SDK EXTENSION PATTERN
 * Each module generates its own SDK client via 'nexical gen api {module}'.
 * This client is exported from '@modules/{module}/src/sdk/index.ts'.
 */
import { UserSDK } from '@modules/user/src/sdk';
import type { UserModuleTypes } from '@modules/user/src/sdk';

/**
 * 1. Aggregating Methods
 * The central 'api' object in @/lib/api/api.ts merges all module SDKs.
 */
export const api = {
  ...client,
  user: new UserSDK(client),
};

/**
 * 2. Aggregating Types
 * Export specific module types through a namespace-like interface to ensure
 * developer discoverability.
 */
export type { UserModuleTypes };

/**
 * 3. Consistent Usage
 * The frontend and other services import the central 'api' object.
 * This ensures all calls share the same configuration and context.
 */
export async function loadData() {
  const { success, data, error } = await api.user.getProfile();

  if (success) {
    // data is strongly typed as UserModuleTypes.Profile
    console.info('User Profile:', data.name);
  } else {
    // error is strongly typed string key
    console.error('Failed to load profile:', error);
  }
}
