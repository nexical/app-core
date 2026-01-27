import { Factory } from "@tests/integration/lib/factory";
import type { ApiClient } from "@tests/integration/lib/client";
import crypto from "node:crypto";

export const actors = {
  user: async (client: ApiClient, params: any = {}) => {
    let actor;
    if (params.id) {
      actor = await Factory.prisma.user.findUnique({
        where: { id: params.id },
      });
    } else if (params.email) {
      // Support email lookup if available
      actor = await Factory.prisma.user.findFirst({
        where: { email: params.email },
      });
    }

    if (!actor) {
      const factoryParams = { ...params };
      if (params.strategy) delete factoryParams.strategy;
      if (params.password) delete factoryParams.password;
      actor = await Factory.create("user", factoryParams);
    }

    const rawKey = `ne_pat_${Date.now()}`;
    let dbKey = rawKey;

    // Auto-hash: Field implies hashing, so we hash the raw key at runtime
    dbKey = crypto.createHash("sha256").update(rawKey).digest("hex");

    // Create Token
    await Factory.create("personalAccessToken", {
      user: { connect: { id: actor.id } },
      name: "Test Token",
      hashedKey: dbKey,
      prefix: "ne_pat_",
    });

    client.useToken(rawKey);

    return actor;
  },
};
