import { NexicalClient } from '@nexical/sdk';
import { config } from '../core/config';

/**
 * The API Base URL is calculated based on the execution environment.
 * - Browser: Relative path (/api) to leverage built-in middleware.
 * - Server: Absolute URL (PUBLIC_SITE_URL) for direct backend access.
 */
// Client-side detection should prioritize window behavior
const isBrowser = typeof window !== 'undefined';
const finalBaseUrl = isBrowser ? '/api' : config.PUBLIC_API_URL;

if (typeof window === 'undefined') {
  console.info('[API] Initializing server-side client with baseUrl:', finalBaseUrl);
} else {
  console.info('[API] Initializing browser client with relative baseUrl: /api');
}

// Global Nexical Client instance
export const api = new NexicalClient({
  baseUrl: finalBaseUrl,
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
