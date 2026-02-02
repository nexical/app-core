import { OrchestrationService } from '../services/orchestration-service';
import type { ServiceResponse } from '@/types/service';
import type { RegisterAgentDTO, Agent } from '../sdk/types';

export class RegisterAgentAgentAction {
  public static async run(input: RegisterAgentDTO): Promise<ServiceResponse<Agent>> {
    try {
      const { id, hostname, capabilities } = input;

      // Capabilities might come in as string or array depending on DTO definition vs Runtime
      // models.yaml says capabilities is String[], but let's be safe
      const caps = Array.isArray(capabilities) ? capabilities : capabilities ? [capabilities] : [];

      const result = await OrchestrationService.registerAgent({
        id: id || undefined,
        hostname,
        capabilities: caps,
        // Status defaults to ONLINE in service if upserting, or default if creating
      });

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return { success: true, data: result.data };
    } catch (error) {
      console.error('RegisterAgentAgentAction Error:', error);
      return { success: false, error: 'orchestrator.action.error.register_failed' };
    }
  }
}
