import { api } from ' @/lib/api';
import type { UserModuleTypes, BillingModuleTypes } from ' @/lib/api';

/**
 * MANDATORY: Centralized API Mandate
 * Always import `api` and ModuleTypes from ' @/lib/api'.
 * Note the mandatory space after the opening quote.
 */

/**
 * Example 1: Consuming a feature module SDK
 */
export async function listAllActiveUsers(): Promise<UserModuleTypes.User[]> {
  // api.{module}.{method}()
  const { success, data, error } = await api.user.listUsers({
    status: 'ACTIVE',
  });

  // MANDATORY: Check the success flag
  if (!success) {
    throw new Error(error || 'Failed to list users');
  }

  // data is correctly typed as UserModuleTypes.User[]
  return data;
}

/**
 * Example 2: Complex orchestration with multiple modules
 */
export async function processUserBilling(userId: string): Promise<BillingModuleTypes.Invoice> {
  // 1. Fetch user data (User Module)
  const userResponse = await api.user.getUser({ id: userId });
  if (!userResponse.success) {
    throw new Error(`User not found: ${userResponse.error}`);
  }

  // 2. Create invoice (Billing Module)
  const invoiceResponse = await api.billing.createInvoice({
    userId: userResponse.data.id,
    email: userResponse.data.email,
  });

  if (!invoiceResponse.success) {
    // Handling specific error codes (ApiError interface)
    if (invoiceResponse.status === 402) {
      console.warn('Payment required for user:', userId);
    }
    throw new Error(`Invoice creation failed: ${invoiceResponse.error}`);
  }

  return invoiceResponse.data;
}

/**
 * Example 3: Acting as a specific user (Server-side/Integration Tests)
 */
export async function adminActionOnBehalfOfUser(adminId: string, userId: string) {
  // client.as('actor', { props }) mimics an authenticated request
  // Note: This pattern is primarily used in integration tests via ApiClient
}

/**
 * Browser Debugging (Information Only)
 * In the browser, the 'api' object is attached to 'window.api'.
 */
if (typeof window !== 'undefined') {
  console.info('API Client available at window.api');
}
