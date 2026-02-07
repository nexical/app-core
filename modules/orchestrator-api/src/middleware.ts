// GENERATED CODE - DO NOT MODIFY
import type { APIContext, MiddlewareNext } from 'astro';
import { db } from '@/lib/core/db';
import crypto from 'node:crypto';

// GENERATED CODE - DO NOT MODIFY
export async function onRequest(context: APIContext, next: MiddlewareNext) {
  const publicRoutes = ['/register', '/[id]/heartbeat'];
  if (publicRoutes.some((route) => context.url.pathname.startsWith(route))) return next();
  const authHeader = context.request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const tokenEntity = await db.agent.findFirst({
      where: { hashedKey: hashedToken },
    });
    const entity = tokenEntity;

    if (entity) {
      context.locals.actor = { ...entity, type: 'agent', role: '${name.toUpperCase()}' };
      context.locals.actorType = 'agent';
      return next();
    }
  }
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
  if (context.locals.actor) return next();
  return next();
}
export default { onRequest };
