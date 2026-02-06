import { Factory } from '@tests/integration/lib/factory';
import type { ApiClient } from '@tests/integration/lib/client';
import crypto from 'node:crypto';

export const actors = {
  agent: async (client: ApiClient, params: Record<string, unknown> = {}) => {
    let actor;
    if (params.id) {
      actor = await Factory.prisma.agent.findUnique({ where: { id: params.id } });
    } else if (params.email) {
      actor = await Factory.prisma.agent.findFirst({ where: { email: params.email } });
    }

    if (!actor) {
      const factoryParams = { ...params };
      if (params.strategy) delete factoryParams.strategy;
      if (params.password) delete factoryParams.password;
      actor = await Factory.create('agent', factoryParams);
    }

    const rawKey = `${Date.now()}`;
    let dbKey = rawKey;

    dbKey = crypto.createHash('sha256').update(rawKey).digest('hex');

    await Factory.create('agent', {
      name: 'Test Token',
      hashedKey: dbKey,
      prefix: '',
    });

    client.useToken(rawKey);

    return actor;
  },
  user: async (client: ApiClient, params: Record<string, unknown> = {}) => {
    let actor;
    if (params.id) {
      actor = await Factory.prisma.user.findUnique({ where: { id: params.id } });
    } else if (params.email) {
      actor = await Factory.prisma.user.findFirst({ where: { email: params.email } });
    }

    if (!actor) {
      const factoryParams = { ...params };
      if (params.strategy) delete factoryParams.strategy;
      if (params.password) delete factoryParams.password;
      actor = await Factory.create('user', factoryParams);
    }

    const rawKey = `ne_pat_${Date.now()}`;
    let dbKey = rawKey;

    dbKey = crypto.createHash('sha256').update(rawKey).digest('hex');

    await Factory.create('personalAccessToken', {
      user: { connect: { id: actor.id } },
      name: 'Test Token',
      hashedKey: dbKey,
      prefix: 'ne_pat_',
    });

    client.useToken(rawKey);

    return actor;
  },
};
