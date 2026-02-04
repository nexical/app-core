import { Auth } from '@auth/core';
import type { Session } from '@auth/core/types';
import { authConfig } from '../../auth.config';

export async function getSession(request: Request): Promise<Session | null> {
  const url = new URL(request.url);
  const isAuthRoute = url.pathname.startsWith('/api/auth');

  // If we're already on an auth route, the session might not be ready or relevant in the same way
  if (isAuthRoute) return null;

  try {
    const session = await Auth(request, authConfig);
    // Explicitly cast the session to the expected type or null
    return (session as unknown as Session) || null;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
}
