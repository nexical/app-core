import { NexicalClient } from '@nexical/sdk';
import { config } from '../core/config';

/**
 * The API Base URL is calculated based on the execution environment.
 * - Browser: Relative path (/api) to leverage built-in middleware.
 * - Server: Absolute URL (PUBLIC_SITE_URL) for direct backend access.
 */
const baseUrl = config.PUBLIC_API_URL;

if (!baseUrl) {
  throw new Error(
    '[API] Configuration Error: PUBLIC_API_URL is missing. ' +
      'Please ensure it is defined in your environment or nexical.yaml.',
  );
}

if (typeof window === 'undefined') {
  console.info('[API] Initializing server-side client with baseUrl:', baseUrl);
}

// Global Nexical Client instance
const client = new NexicalClient({
  baseUrl,
});

/**
 * CENTRALIZED API AGGREGATOR
 * All SDK access (methods and types) MUST be routed through this object.
 * Modules register themselves here during generation.
 *
 * NOTE: We use Object.assign to preserve the 'client' prototype methods (get, post, etc.)
 */
export const api = Object.assign(client, {
  // [GENERATOR: MODULES_START]
  // [GENERATOR: MODULES_END]
});

// Platform Debugging Hook
if (typeof window !== 'undefined') {
  (window as unknown as { api: typeof api }).api = api;
}

/**
 * STRONGLY-TYPED ERROR INTERFACES
 * Zero-tolerance for the 'any' type.
 */
export interface ApiError {
  body?: {
    error?: string;
    message?: string;
  };
  message?: string;
  status?: number;
}
