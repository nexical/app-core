// GENERATED CODE - DO NOT MODIFY
import type { ServiceResponse } from '@/types/service';
import type { APIContext } from 'astro';
import type { HeartbeatDTO } from '../sdk/types';
import { AgentService } from '../services/agent-service';
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
export class HeartbeatAgentAction {
  public static async run(
    input: HeartbeatDTO,
    context: APIContext,
  ): Promise<ServiceResponse<void>> {
    const response = await AgentService.update(input.id, {
      lastHeartbeat: new Date(),
      status: 'ONLINE',
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: undefined };
  }
}
