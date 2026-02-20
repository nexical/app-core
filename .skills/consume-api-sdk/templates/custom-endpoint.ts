import { defineApi } from ' @/lib/api/api-docs';
import { parseQuery } from ' @/lib/api/api-query';
import { db } from ' @/lib/core/db';
import type { APIRoute } from 'astro';

/**
 * MANDATORY: API Infrastructure Abstraction (defineApi)
 * Use `defineApi` to wrap manual endpoints for consistent response
 * formatting, error handling, and security enforcement.
 */

export const GET: APIRoute = defineApi(
  async (ctx) => {
    /**
     * MANDATORY: Prisma-Compatible Query Parsing (parseQuery)
     * All list endpoints should use `parseQuery` to maintain
     * consistent filtering and pagination logic.
     */
    const { where, take, skip, orderBy } = parseQuery<Prisma.UserWhereInput>(ctx.url.searchParams, {
      allowedFilters: ['email', 'role', 'status'],
      defaultOrderBy: { createdAt: 'desc' },
    });

    // Orchestrate with db or Service
    const items = await db.user.findMany({
      where,
      take,
      skip,
      orderBy,
    });

    const total = await db.user.count({ where });

    /**
     * MANDATORY: Uniform Service Response
     * Return success, data, and optional total.
     */
    return {
      success: true,
      data: items,
      total,
    };
  },
  {
    /**
     * OpenAPI Metadata (Required for generation and documentation)
     */
    summary: 'List users with advanced filtering',
    description: 'Returns a paginated list of users filtered by email or role.',
    responses: {
      200: {
        description: 'Successfully retrieved user list.',
      },
    },
  },
);

/**
 * MANDATORY: Security and Guarding
 * Use context locals to verify the actor.
 */
export const POST: APIRoute = defineApi(async ({ locals, request }) => {
  if (!locals.actor) {
    throw new Error('Unauthorized');
  }

  const _payload = await request.json();

  // Delegation to Service Layer
  // return await UserService.create(_payload, locals.actor);

  return {
    success: true,
    data: { id: 'new-item-id' },
  };
});
