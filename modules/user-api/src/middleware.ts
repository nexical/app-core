// GENERATED CODE - DO NOT MODIFY
import { db } from '@/lib/core/db';
import crypto from 'node:crypto';
import type { APIContext, MiddlewareNext } from 'astro';

// GENERATED CODE - DO NOT MODIFY
export async function onRequest(context: APIContext, next: MiddlewareNext) {
  const publicRoutes = [
    '/register',
    '/login',
    '/verify-email',
    '/password/request-reset',
    '/password/reset',
    '/password/validate-token',
  ];
  if (publicRoutes.some((route) => context.url.pathname.startsWith(route))) return next();
  const authHeader = context.request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ne_pat_')) {
    const token = authHeader.substring(7);
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const tokenEntity = await db.personalAccessToken.findFirst({
      where: { hashedKey: hashedToken },
      include: { user: true },
    });
    const entity = tokenEntity?.user;

    if (entity) {
      context.locals.actor = { ...entity, type: 'user', role: '${name.toUpperCase()}' };
      context.locals.actorType = 'user';
      return next();
    }
  }
  if (context.locals.actor && context.locals.actorType === 'user') {
    const actorCheck = await db.user.findUnique({
      where: { id: context.locals.actor.id },
      select: { status: true },
    });

    if (!actorCheck || actorCheck.status !== 'ACTIVE') {
      context.locals.actor = undefined;
      return new Response(JSON.stringify({ error: 'Session revoked' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return next();
  }
  return next();
}
export default { onRequest };
