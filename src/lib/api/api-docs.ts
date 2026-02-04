import type { APIRoute, APIContext } from 'astro';

import { getApiModules } from '../core/glob-helper';

export type ApiActor = App.Locals['actor'];

export interface OpenAPIParameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  schema?: Record<string, unknown>; // JSON Schema
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  example?: unknown;
  examples?: Record<string, unknown>;
}

export interface OpenAPIRequestBody {
  description?: string;
  content: Record<
    string,
    {
      schema?: Record<string, unknown>; // JSON Schema
      example?: unknown;
      examples?: Record<string, unknown>;
      encoding?: Record<string, unknown>;
    }
  >;
  required?: boolean;
}

export interface OpenAPIResponse {
  description: string;
  headers?: Record<string, unknown>;
  content?: Record<
    string,
    {
      schema?: Record<string, unknown>;
      example?: unknown;
      examples?: Record<string, unknown>;
      encoding?: Record<string, unknown>;
    }
  >;
  links?: Record<string, unknown>;
}

export interface OpenAPIRouteDocs {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: OpenAPIParameter[];
  requestBody?: OpenAPIRequestBody;
  responses?: Record<string, OpenAPIResponse>;
  /**
   * Predicate to determine if this endpoint should be visible in the generated docs.
   * If undefined, it is visible to everyone (public).
   * If defined, it is only visible if the predicate returns true for the given actor.
   */
  visibility?: (actor: ApiActor) => boolean;
  /**
   * If true (default), the endpoint requires authentication.
   * If false, it is public.
   */
  protected?: boolean;
}

export interface ApiRouteHandler extends APIRoute {
  schema?: OpenAPIRouteDocs;
}

export type ApiHandler<T = unknown> = (
  context: APIContext,
  actor: ApiActor,
) => Promise<Response | T> | Response | T;

/**
 * Define an API endpoint with OpenAPI metadata.
 * Automatically handles:
 * - Authentication (if protected !== false)
 * - Error catching (returns 400/403/500 JSON)
 * - JSON response wrapping (if handler returns non-Response object)
 */
export function defineApi<T>(handler: ApiHandler<T>, docs: OpenAPIRouteDocs = {}): ApiRouteHandler {
  const wrappedHandler: APIRoute = async (context) => {
    // 1. Auth Check
    const isProtected = docs.protected !== false;
    if (isProtected && !context.locals.actor) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
      // 2. Execution
      // We pass actor as second arg for convenience, even though it's in context.locals
      const result = await handler(context, context.locals.actor);

      // 3. Response Handling
      if (result instanceof Response) {
        return result;
      }

      if (result === null || result === undefined) {
        return new Response(null, { status: 204 });
      }

      // Auto-JSON
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e: unknown) {
      // 4. Error Handling
      const err = e instanceof Error ? e : new Error(String(e));
      const errName = err.name || 'Error';
      const errMessage = err.message || 'Unknown';
      console.error(`[API Error] ${errName}: ${errMessage}`);

      let status = 500;
      const message = err.message || '';
      const lowerMessage = message.toLowerCase();

      if (
        lowerMessage.includes('unauthorized') ||
        lowerMessage.includes('forbidden') ||
        lowerMessage.includes('denied') ||
        lowerMessage.includes('not a member')
      ) {
        status = 403;
      } else if (
        errName === 'ZodError' ||
        lowerMessage.includes('invalid') ||
        lowerMessage.includes('already exists') ||
        lowerMessage.includes('exists') ||
        lowerMessage.includes('mismatch')
      ) {
        status = 400;
      } else if (lowerMessage.includes('not found')) {
        status = 404;
      }

      // Safe access to potential extra properties like 'details' or 'issues'
      // commonly found in ZodError or custom ApiError
      const details =
        (err as { details?: unknown; issues?: unknown }).details ||
        (err as { issues?: unknown }).issues;

      return new Response(
        JSON.stringify({
          error: message || 'Internal Server Error',
          details,
        }),
        {
          status,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  };

  (wrappedHandler as ApiRouteHandler).schema = docs;
  return wrappedHandler as ApiRouteHandler;
}

/**
 * Generates regular OpenAPI paths object for a specific module.
 *
 * @param module The module configuration from ModuleDiscovery
 * @param actor The current actor (if authorized) to filter visibility. If undefined, implies System/Public view (ALL docs).
 */
export async function generateDocs(
  module: { path: string; name: string },
  actor?: ApiActor,
): Promise<Record<string, Record<string, unknown>>> {
  const paths: Record<string, Record<string, unknown>> = {};
  const modulePrefix = `/modules/${module.name}/src/pages/api`;

  const allApiModules = getApiModules();
  for (const [fileIdentifier, mod] of Object.entries(allApiModules)) {
    // Filter by current module
    if (!fileIdentifier.includes(modulePrefix)) continue;

    // Determine route path
    // e.g. /modules/chat-api/src/pages/api/ai-persona/index.ts -> /ai-persona
    let routePath = fileIdentifier.replace(modulePrefix, '').replace(/\.(ts|js)$/, '');

    if (routePath.endsWith('/index')) {
      routePath = routePath.slice(0, -6);
    }

    if (routePath === '') routePath = '/';

    // Convert Astro [param] to OpenAPI {param}
    const openApiPath = routePath.replace(/\[([^\]]+)\]/g, '{$1}');
    const pathItem: Record<string, unknown> = {};
    const apiMod = mod as Record<string, ApiRouteHandler>;

    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

    for (const method of methods) {
      if (apiMod[method]) {
        const handler = apiMod[method];
        const schema = handler.schema || {};

        let isVisible = true;
        if (actor) {
          if (schema.visibility) {
            isVisible = schema.visibility(actor);
          } else {
            isVisible = true;
          }
        } else {
          isVisible = true;
        }

        if (isVisible) {
          pathItem[method.toLowerCase()] = {
            tags: schema.tags || [module.name],
            summary: schema.summary,
            description: schema.description,
            operationId: schema.operationId,
            parameters: schema.parameters,
            requestBody: schema.requestBody,
            responses: schema.responses || { 200: { description: 'OK' } },
          };
        }
      }
    }

    if (Object.keys(pathItem).length > 0) {
      paths[openApiPath] = pathItem;
    }
  }

  return paths;
}
