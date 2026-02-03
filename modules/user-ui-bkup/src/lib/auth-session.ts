import { Auth } from '@auth/core';
import { authConfig } from '@modules/user-ui/auth.config';

export async function getSession(request: Request) {
  const url = new URL('/api/auth/session', request.url);

  try {
    const response = await Auth(new Request(url, { headers: request.headers }), authConfig);
    const { status = 200 } = response;

    if (status !== 200) return null;

    const data = await response.json();
    if (!data || !Object.keys(data).length) return null;
    return data;
  } catch (e: unknown) {
    const error = e as Error;
    console.error('[AuthSession] getSession failed:', error.message);
    return null;
  }
}
