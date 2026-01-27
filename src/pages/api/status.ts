import type { APIRoute } from 'astro';

// If static, we prerender this route. If server, we leave it dynamic.
export const prerender = process.env.PUBLIC_SITE_MODE === 'static';

export const GET: APIRoute = async (_ctx) => {
    return new Response('OK');
};