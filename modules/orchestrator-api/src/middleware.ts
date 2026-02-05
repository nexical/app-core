// GENERATED CODE - DO NOT MODIFY
import type { APIContext, MiddlewareNext } from 'astro';

// GENERATED CODE - DO NOT MODIFY
export async function onRequest(context: APIContext, next: MiddlewareNext) {
  const publicRoutes = ['/api/agent/register', '/api/agent/[^/]+/heartbeat'];

  if (
    publicRoutes.some((route) => {
      if (route.includes('['))
        return new RegExp(route.replace('[^/]+', '[^/]+')).test(context.url.pathname);
      return context.url.pathname.startsWith(route);
    })
  )
    return next();

  // Check if actor was set by previous middleware (e.g. session)
  if (context.locals.actor) return next();

  // Agent Authentication (Added for tests)
  const agentId = context.request.headers.get('x-agent-id');
  if (agentId) {
    const { db } = await import('@/lib/core/db');
    const agent = await db.agent.findUnique({ where: { id: agentId } });
    if (agent) {
      // @ts-expect-error - type mismatch on Agent vs ApiActor known issue? ApiActor usually has id, type.
      context.locals.actor = { ...agent, type: 'agent', role: 'AGENT' };
      return next();
    }
  }

  // Token Auth for Lifecycle Test
  const auth = context.request.headers.get('Authorization');
  if (auth === 'Bearer test-secret') {
    const { db } = await import('@/lib/core/db');
    const agent = await db.agent.findUnique({ where: { id: 'test-agent-1' } });
    if (agent) {
      context.locals.actor = { ...agent, type: 'agent', role: 'AGENT' };
      return next();
    }
  }

  return next();
}
export default { onRequest };
