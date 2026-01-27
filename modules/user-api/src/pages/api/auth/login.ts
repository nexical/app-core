// GENERATED CODE - DO NOT MODIFY
import { defineApi } from "@/lib/api/api-docs";
import { ApiGuard } from "@/lib/api/api-guard";
import { HookSystem } from "@/lib/modules/hooks";
import { LoginAuthAction } from "@modules/user-api/src/actions/login-auth";
import type { LoginDTO } from "@modules/user-api/src/sdk";
export const POST = defineApi(
  async (context) => {
    // 1. Body Parsing (Input)
    const body = (await context.request.json()) as LoginDTO;
    const query = Object.fromEntries(new URL(context.request.url).searchParams);

    // 2. Hook: Filter Input
    const input: LoginDTO = await HookSystem.filter("auth.login.input", body);

    // 3. Security Check
    // Pass merged input
    const combinedInput = { ...context.params, ...query, ...input };
    await ApiGuard.protect(context, "anonymous", combinedInput);

    // Inject userId from context for protected routes
    const user = (context as any).user;
    if (user && user.id) {
      Object.assign(combinedInput, { userId: user.id });
    }

    // 4. Action Execution
    const result = await LoginAuthAction.run(combinedInput, context);

    // 5. Hook: Filter Output
    const filteredResult = await HookSystem.filter("auth.login.output", result);

    // 6. Response
    if (!filteredResult.success) {
      return new Response(JSON.stringify({ error: filteredResult.error }), {
        status: 400,
      });
    }

    return { success: true, data: filteredResult.data };
  },
  {
    summary: "Login user",
    tags: ["Auth"],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              email: { type: "string" },
              password: { type: "string" },
            },
            required: ["email", "password"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "OK",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string" },
                username: { type: "string" },
                email: { type: "string" },
                passwordUpdatedAt: { type: "string", format: "date-time" },
                emailVerified: { type: "string", format: "date-time" },
                name: { type: "string" },
                image: { type: "string" },
                role: { type: "string" },
                status: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
              },
              required: ["updatedAt"],
            },
          },
        },
      },
    },
    protected: false,
  },
);
