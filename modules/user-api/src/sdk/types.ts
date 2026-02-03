// GENERATED CODE - DO NOT MODIFY BY HAND
import type { PersonalAccessToken } from '@prisma/client';

// GENERATED CODE - DO NOT MODIFY BY HAND
export interface CreateUserDTO {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
  username?: string;
  token?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface InviteUserDTO {
  email: string;
  role?: SiteRole;
}

export interface RequestPasswordResetDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyEmailDTO {
  token: string;
}

export interface UpdateUserDTO {
  id: string;
  name?: string;
  username?: string;
  email?: string;
  image?: string;
  role?: SiteRole;
  status?: UserStatus;
  password?: string;
}

export interface CreateTokenDTO {
  userId?: string;
  name: string;
  expiresAt?: Date;
}

export interface ValidateResetTokenDTO {
  token: string;
}

export interface ValidateResetTokenResponseDTO {
  valid: boolean;
  email?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LogoutDTO {}

export interface DeleteMeDTO {
  userId?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ListTokensDTO {}

export interface DeleteTokenDTO {
  id: string;
  userId?: string;
}

export interface CreateTokenResponseDTO {
  token: PersonalAccessToken;
  rawKey: string;
}

export interface VerifyEmailResponseDTO {
  userId: string;
  email: string;
}

export interface ResetPasswordResponseDTO {
  userId: string;
}

export enum SiteRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  CONTRACTOR = 'CONTRACTOR',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED',
}

export enum UserMode {
  SINGLE = 'SINGLE',
  PUBLIC = 'PUBLIC',
  ADMIN = 'ADMIN',
}

export type {
  User,
  PersonalAccessToken,
  Account,
  VerificationToken,
  PasswordResetToken,
  Invitation,
} from '@prisma/client';
