// GENERATED CODE - DO NOT MODIFY
import type { APIContext, MiddlewareNext } from 'astro';
// GENERATED CODE - DO NOT MODIFY
export async function onRequest(context: APIContext, next: MiddlewareNext) {
  const publicRoutes = [];
  if (publicRoutes.some((route) => context.url.pathname.startsWith(route))) return next();
  // Dynamic Bouncer Pattern: Validate Actor Status

  // Check if actor was set by previous middleware (e.g. session)
  if (context.locals.actor) return next();
  return next();
}
export default { onRequest };
