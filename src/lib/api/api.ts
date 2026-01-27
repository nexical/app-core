import { NexicalClient } from '@nexical/sdk';

const baseUrl = typeof window !== 'undefined'
    ? '/api'
    : (process.env.PUBLIC_SITE_URL || 'http://localhost:4321') + '/api';

if (typeof window === 'undefined') {
    console.log('[API] Initializing server-side client with baseUrl:', baseUrl);
}

export const api = new NexicalClient({
    baseUrl,
});

// Attach to window for debugging in the browser
if (typeof window !== 'undefined') {
    (window as any).api = api;
}

export interface ApiError {
    body?: {
        error?: string;
        message?: string;
    };
    message?: string;
    status?: number;
}
