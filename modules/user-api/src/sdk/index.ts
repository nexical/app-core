// GENERATED CODE - DO NOT MODIFY BY HAND
import { ApiClient } from '@nexical/sdk/core';
import { UserSDK as BaseUserSDK } from './user-sdk.js';
import { AuthSDK as BaseAuthSDK } from './auth-sdk.js';

// GENERATED CODE - DO NOT MODIFY BY HAND
export * from './user-sdk.js';
export * from './auth-sdk.js';
export * from './types.js';

/** Main SDK for the user-api module. */
export class UserModule extends BaseUserSDK {
  public auth: BaseAuthSDK;

  constructor(client: ApiClient) {
    super(client);
    this.auth = new BaseAuthSDK(client);
  }
}
