import type { APIRoute } from 'astro';
import { ModuleDiscovery } from '@/lib/modules/module-discovery';
import { config } from '@/lib/core/config';
import { generateDocs } from '@/lib/api/api-docs';

// Force reload timestamp: 7
export const GET: APIRoute = async (context) => {
  const modules = await ModuleDiscovery.loadModules();
  const actor = context.locals.actor;

  const openApiDoc: any = {
    openapi: '3.0.0',
    info: {
      title: config.PUBLIC_SITE_NAME,
      version: config.PUBLIC_SITE_VERSION,
      description: config.PUBLIC_API_DESCRIPTION,
    },
    servers: [{ url: '/api' }],
    paths: {},
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // or just opaque string
        },
        CookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'authjs.session-token',
        },
      },
    },
    security: [{ BearerAuth: [] }, { CookieAuth: [] }],
  };

  for (const module of modules) {
    const moduleDocs = await generateDocs(module, actor);
    openApiDoc.paths = { ...openApiDoc.paths, ...moduleDocs };
  }

  return new Response(JSON.stringify(openApiDoc, null, 2), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
