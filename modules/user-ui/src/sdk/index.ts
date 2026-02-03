import { BaseResource, ApiClient } from '@nexical/sdk-core';
import { UserUiSDK as BaseUserUiSDK } from './user-ui-sdk.js';

// GENERATED CODE - DO NOT MODIFY BY HAND
/** Main SDK for the user-ui module. */
export class UserUiModule extends BaseResource {
  public userUi: BaseUserUiSDK;

  constructor(client: ApiClient) {
    super(client);
    this.userUi = new BaseUserUiSDK(client);
  }
}

export * from './user-ui-sdk.js';
export * from './types.js';
