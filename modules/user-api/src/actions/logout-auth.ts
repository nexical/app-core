// GENERATED CODE - DO NOT MODIFY
import type { ServiceResponse } from '@/types/service';
import type { LogoutDTO } from '../sdk/types';
import type { APIContext } from 'astro';

export class LogoutAuthAction {
  public static async run(input: LogoutDTO, context: APIContext): Promise<ServiceResponse<void>> {
    return { success: true, data: {} };
  }
}
