// GENERATED CODE - DO NOT MODIFY BY HAND
import { BaseResource } from '@nexical/sdk-core';
import type {
  CreateUserDTO,
  User,
  LoginDTO,
  LogoutDTO,
  InviteUserDTO,
  Invitation,
  VerifyEmailDTO,
  VerifyEmailResponseDTO,
  RequestPasswordResetDTO,
  ResetPasswordDTO,
  ResetPasswordResponseDTO,
  ValidateResetTokenDTO,
  ValidateResetTokenResponseDTO,
} from './types';

// GENERATED CODE - DO NOT MODIFY BY HAND
/** SDK client for Auth. */
export class AuthSDK extends BaseResource {
  public async register(
    data: CreateUserDTO,
  ): Promise<{ success: boolean; data: User; error?: string }> {
    return this._request('POST', `/auth/register`, data);
  }

  public async login(data: LoginDTO): Promise<{ success: boolean; data: User; error?: string }> {
    return this._request('POST', `/auth/login`, data);
  }

  public async logout(data: LogoutDTO): Promise<{ success: boolean; data: void; error?: string }> {
    return this._request('POST', `/auth/logout`, data);
  }

  public async inviteUser(
    data: InviteUserDTO,
  ): Promise<{ success: boolean; data: Invitation; error?: string }> {
    return this._request('POST', `/auth/invite`, data);
  }

  public async verifyEmail(
    data: VerifyEmailDTO,
  ): Promise<{ success: boolean; data: VerifyEmailResponseDTO; error?: string }> {
    return this._request('POST', `/auth/verify-email`, data);
  }

  public async requestPasswordReset(
    data: RequestPasswordResetDTO,
  ): Promise<{ success: boolean; data: void; error?: string }> {
    return this._request('POST', `/auth/password/request-reset`, data);
  }

  public async resetPassword(
    data: ResetPasswordDTO,
  ): Promise<{ success: boolean; data: ResetPasswordResponseDTO; error?: string }> {
    return this._request('POST', `/auth/password/reset`, data);
  }

  public async validateResetToken(
    data: ValidateResetTokenDTO,
  ): Promise<{ success: boolean; data: ValidateResetTokenResponseDTO; error?: string }> {
    return this._request('POST', `/auth/password/validate-token`, data);
  }
}
