// GENERATED CODE - DO NOT MODIFY
import { defineApi } from "@/lib/api/api-docs";
import { ApiGuard } from "@/lib/api/api-guard";
import { HookSystem } from "@/lib/modules/hooks";
import { DeleteTokenUserAction } from "@modules/user-api/src/actions/delete-token-user";
import type { DeleteTokenDTO } from "@modules/user-api/src/sdk";
export const DELETE = defineApi(
  async (context) => {
    // 1. Body Parsing (Input)
    const body = (await context.request.json()) as DeleteTokenDTO;
    const query = Object.fromEntries(new URL(context.request.url).searchParams);

    // 2. Hook: Filter Input
    const input: DeleteTokenDTO = await HookSystem.filter(
      "user.deleteToken.input",
      body,
    );

    // 3. Security Check
    // Pass merged input
    const combinedInput = { ...context.params, ...query, ...input };
    await ApiGuard.protect(context, "member", combinedInput);

    // Inject userId from context for protected routes
    const user = (context as any).user;
    if (user && user.id) {
      Object.assign(combinedInput, { userId: user.id });
    }

    // 4. Action Execution
    const result = await DeleteTokenUserAction.run(combinedInput, context);

    // 5. Hook: Filter Output
    const filteredResult = await HookSystem.filter(
      "user.deleteToken.output",
      result,
    );

    // 6. Response
    if (!filteredResult.success) {
      return new Response(JSON.stringify({ error: filteredResult.error }), {
        status: 400,
      });
    }

    return { success: true, data: filteredResult.data };
  },
  {
    summary: "Delete personal access token",
    tags: ["User"],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              id: { type: "string" },
              userId: { type: "string" },
            },
            required: ["id"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "OK",
        content: {
          "application/json": {
            schema: { type: "object" },
          },
        },
      },
    },
  },
);
