import type { APIContext } from 'astro';
import { Factory } from '../lib/factory';

/**
 * Creates a mock APIContext for testing service actions.
 * @param role Optional role for the actor (e.g. 'ADMIN')
 * @param type Optional type for the actor (e.g. 'user')
 * @param id Optional ID for the actor.
 */
export async function createMockContext(
  role?: string,
  type: string = 'user',
  id?: string,
): Promise<APIContext> {
  let actor = null;

  if (role || id) {
    actor = await Factory.create(type, {
      ...(id ? { id } : {}),
      ...(role ? { role } : {}),
    });
  }

  return {
    locals: {
      actor,
    },
    url: new URL('http://localhost/api'),
    params: {},
    request: new Request('http://localhost/api'),
    redirect: (path: string) => new Response(null, { status: 302, headers: { Location: path } }),
  } as unknown as APIContext;
}
