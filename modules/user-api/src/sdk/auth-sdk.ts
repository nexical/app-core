// GENERATED CODE - DO NOT MODIFY BY HAND
import { BaseResource, ApiClient } from "@nexical/sdk-core";
import type {
  CreateUserDTO,
  User,
  LoginDTO,
  InviteUserDTO,
  Invitation,
  VerifyEmailDTO,
  RequestPasswordResetDTO,
  ResetPasswordDTO,
  LogoutDTO,
  ValidateResetTokenDTO,
  ValidateResetTokenResponseDTO,
} from "./types";

/** SDK client for Auth. */
export class AuthSDK extends BaseResource {
  public async list(params?: {
    search?: string;
    filters?: Record<string, any>;
  }): Promise<{ data: Auth[]; meta: { total: number } }> {
    const query = this.buildQuery({
      ...params?.filters,
      search: params?.search,
    });
    return this.request("GET", `/auth${query}`);
  }

  public async get(id: string): Promise<Auth> {
    return this.request("GET", `/auth/${id}`);
  }

  public async create(data: Partial<Auth>): Promise<Auth> {
    return this.request("POST", `/auth`, data);
  }

  public async update(id: string, data: Partial<Auth>): Promise<Auth> {
    return this.request("PUT", `/auth/${id}`, data);
  }

  public async delete(id: string): Promise<{ success: boolean }> {
    return this.request("DELETE", `/auth/${id}`);
  }

  public async checkAuthStatus(): Promise<any> {
    return this.request("GET", `/auth/status`);
  }

  public async register(
    data: CreateUserDTO,
  ): Promise<{ success: boolean; data: User; error?: string }> {
    return this._request("POST", `/auth/register`, data);
  }

  public async login(
    data: LoginDTO,
  ): Promise<{ success: boolean; data: User; error?: string }> {
    return this._request("POST", `/auth/login`, data);
  }

  public async logout(
    data: LogoutDTO,
  ): Promise<{ success: boolean; data: any; error?: string }> {
    return this._request("POST", `/auth/logout`, data);
  }

  public async inviteUser(
    data: InviteUserDTO,
  ): Promise<{ success: boolean; data: Invitation; error?: string }> {
    return this._request("POST", `/auth/invite`, data);
  }

  public async verifyEmail(
    data: VerifyEmailDTO,
  ): Promise<{ success: boolean; data: any; error?: string }> {
    return this._request("POST", `/auth/verify-email`, data);
  }

  public async requestPasswordReset(
    data: RequestPasswordResetDTO,
  ): Promise<{ success: boolean; data: any; error?: string }> {
    return this._request("POST", `/auth/password/request-reset`, data);
  }

  public async resetPassword(
    data: ResetPasswordDTO,
  ): Promise<{ success: boolean; data: any; error?: string }> {
    return this._request("POST", `/auth/password/reset`, data);
  }

  public async validateResetToken(
    data: ValidateResetTokenDTO,
  ): Promise<{
    success: boolean;
    data: ValidateResetTokenResponseDTO;
    error?: string;
  }> {
    return this._request("POST", `/auth/password/validate-token`, data);
  }
}
