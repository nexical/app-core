// GENERATED CODE - DO NOT MODIFY
import type { ServiceResponse } from '@/types/service';
import type { APIContext } from 'astro';
import type { HeartbeatDTO } from '../sdk/types';

// GENERATED CODE - DO NOT MODIFY
export class HeartbeatAgentAction {
  public static async run(
    input: HeartbeatDTO,
    context: APIContext,
  ): Promise<ServiceResponse<void>> {
    return { success: true, data: {} as unknown as void };
  }
}
