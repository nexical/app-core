// GENERATED CODE - DO NOT MODIFY BY HAND
import { BaseResource, ApiClient } from "@nexical/sdk-core";
import { UserSDK as BaseUserSDK } from "./user-sdk";

import { AuthSDK as BaseAuthSDK } from "./auth-sdk";
export * from "./auth-sdk";
export * from "./types";
export * from "./user-sdk";

/** Main SDK for the user-api module. */
export class UserSDK extends BaseUserSDK {
  public auth: BaseAuthSDK;

  constructor(client: ApiClient) {
    super(client);
    this.auth = new BaseAuthSDK(client);
  }
}
