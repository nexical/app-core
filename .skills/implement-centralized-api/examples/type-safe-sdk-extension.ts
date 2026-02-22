import { api as baseApi } from '@/lib/api/api';

/**
 * MODULE SDK EXTENSION PATTERN
 * Each module generates its own SDK client via 'nexical gen api {module}'.
 * This client is exported from '@modules/{module}/src/sdk/index.ts'.
 */
import { UserSDK } from '@modules/user/src/sdk';
import type { UserModuleTypes } from '@modules/user/src/sdk';

/**
 * 1. Aggregating Methods
 * The central 'api' object in @core/src/lib/api/api.ts merges all module SDKs.
 */
export const api = {
  ...baseApi,
  user: new UserSDK(baseApi),
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
  // MANDATORY: Check 'success' before accessing 'data' (CODE.md compliance)
  const { success, data, error } = await api.user.getProfile();

  if (success) {
    // data is strongly typed as UserModuleTypes.Profile
    console.info('User Profile:', data.name);
  } else {
    // error is strongly typed string key (translation key)
    console.error('Failed to load profile:', error);
  }
}
