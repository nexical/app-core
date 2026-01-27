export type {
  User,
  PersonalAccessToken,
  Account,
  VerificationToken,
  PasswordResetToken,
  Invitation,
} from "@prisma/client";

export const SiteRole = {
  ADMIN: "ADMIN",
  EMPLOYEE: "EMPLOYEE",
  CONTRACTOR: "CONTRACTOR",
} as const;
export type SiteRole = (typeof SiteRole)[keyof typeof SiteRole];

export const UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  BANNED: "BANNED",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const UserMode = {
  SINGLE: "SINGLE",
  PUBLIC: "PUBLIC",
  ADMIN: "ADMIN",
} as const;
export type UserMode = (typeof UserMode)[keyof typeof UserMode];

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
  name?: string;
  username?: string;
  email?: string;
  image?: string;
  role?: SiteRole;
  status?: UserStatus;
  password?: string;
  id: string;
}

export interface CreateTokenDTO {
  name: string;
  expiresAt?: Date;
  userId?: string;
}

export interface Auth {}

export interface DeleteTokenDTO {
  id: string;
  userId?: string;
}

export interface ListTokensDTO {
  userId: string;
  skip?: number;
  take?: number;
}

export interface LogoutDTO {}

export interface ValidateResetTokenDTO {
  token: string;
}

export interface ValidateResetTokenResponseDTO {
  valid: boolean;
  email?: string;
}

export interface DeleteMeDTO {
  userId?: string;
}

export interface CreateTokenResponseDTO {
  token: PersonalAccessToken;
  rawKey: string;
}
