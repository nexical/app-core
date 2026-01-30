import { ApiClient, type ApiClientOptions } from '@nexical/sdk-core';
import { initializeSdkRegistry, type SdkRegistry } from './registry.generated';

export * from '@nexical/sdk-core';

export interface NexicalClient extends SdkRegistry {}

export class NexicalClient extends ApiClient {
  constructor(options: ApiClientOptions) {
    super(options);
    Object.assign(this, initializeSdkRegistry(this));
  }
}
