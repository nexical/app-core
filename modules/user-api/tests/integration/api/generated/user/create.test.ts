// GENERATED CODE - DO NOT MODIFY
import { describe, it, expect, beforeEach } from "vitest";
import { ApiClient } from "@tests/integration/lib/client";
import { Factory } from "@tests/integration/lib/factory";
import { TestServer } from "@tests/integration/lib/server";

// GENERATED CODE - DO NOT MODIFY
const _test = describe("User API - Create", () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // POST /api/user
  describe("POST /api/user", () => {
    it("should allow admin to create user", async () => {
      const actor = await client.as("user", { role: "ADMIN" });

      const payload = {
        passwordUpdatedAt: new Date().toISOString(),
      };

      const res = await client.post("/api/user", payload);

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.passwordUpdatedAt).toBe(payload.passwordUpdatedAt); // API returns ISO string

      const created = await Factory.prisma.user.findUnique({
        where: { id: res.body.data.id },
      });
      expect(created).toBeDefined();
    });

    it("should forbid non-admin/unauthorized users", async () => {
      (client as any).bearerToken = "invalid-token";
      const actor = undefined as any;

      const payload = {
        passwordUpdatedAt: new Date().toISOString(),
      };
      const res = await client.post("/api/user", payload);
      expect([401, 403, 404]).toContain(res.status);
    });
  });
});
