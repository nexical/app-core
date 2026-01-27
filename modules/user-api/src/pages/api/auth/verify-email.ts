// GENERATED CODE - DO NOT MODIFY
import { defineApi } from "@/lib/api/api-docs";
import { ApiGuard } from "@/lib/api/api-guard";
import { HookSystem } from "@/lib/modules/hooks";
import { VerifyEmailAuthAction } from "@modules/user-api/src/actions/verify-email-auth";
import type { VerifyEmailDTO } from "@modules/user-api/src/sdk";
export const POST = defineApi(
  async (context) => {
    // 1. Body Parsing (Input)
    const body = (await context.request.json()) as VerifyEmailDTO;
    const query = Object.fromEntries(new URL(context.request.url).searchParams);

    // 2. Hook: Filter Input
    const input: VerifyEmailDTO = await HookSystem.filter(
      "auth.verifyEmail.input",
      body,
    );

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
    const result = await VerifyEmailAuthAction.run(combinedInput, context);

    // 5. Hook: Filter Output
    const filteredResult = await HookSystem.filter(
      "auth.verifyEmail.output",
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
    summary: "Verify email address",
    tags: ["Auth"],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              token: { type: "string" },
            },
            required: ["token"],
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
    protected: false,
  },
);
