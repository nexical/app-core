import { Factory } from '@tests/integration/lib/factory';
import type { ApiClient } from '@tests/integration/lib/client';

export const actors = {
  agent: async (client: ApiClient, params: Record<string, unknown> = {}) => {
    // Agents currently authenticate via a User/Admin token for flexibility in tests
    const user = await client.as('user', { role: 'ADMIN', name: 'Agent Host' });

    let agent;
    if (params.id) {
      agent = await Factory.prisma.agent.findUnique({ where: { id: params.id } });
    }

    if (!agent) {
      const agentData = {
        hostname: 'test-agent',
        capabilities: ['test.echo'],
        ...params,
      };
      agent = await Factory.create('agent', agentData);
    }

    return { ...agent, user };
  },
};
