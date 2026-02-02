// GENERATED CODE - DO NOT MODIFY
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Factory } from '@tests/integration/lib/factory';

export const factories = {
  user: (index: number) => {
    return {
      username: `username_${index}_${crypto.randomUUID().split('-')[0]}`,
      email: `${index}_${crypto.randomUUID()}@example.com`.toLowerCase(),
      passwordUpdatedAt: new Date(),
      emailVerified: new Date(),
      name: `name_${index}`,
      image: `image_${index}`,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      password: hashPassword('Password123!'),
    };
  },
  personalAccessToken: (index: number) => {
    return {
      name: `name_${index}`,
      hashedKey: `hashedKey_${index}_${crypto.randomUUID().split('-')[0]}`,
      prefix: `prefix_${index}`,
      lastUsedAt: new Date(),
      expiresAt: new Date(),
      user: {
        create: Factory.getBuilder('user')(index),
      },
    };
  },
  account: (index: number) => {
    return {
      user: {
        create: Factory.getBuilder('user')(index),
      },
      type: `type_${index}`,
      provider: `provider_${index}`,
      providerAccountId: `providerAccountId_${index}`,
      refresh_token: `refresh_token_${index}`,
      access_token: `access_token_${index}`,
      expires_at: index,
      token_type: `token_type_${index}`,
      scope: `scope_${index}`,
      id_token: `id_token_${index}`,
      session_state: `session_state_${index}`,
    };
  },
  verificationToken: (index: number) => {
    return {
      identifier: `identifier_${index}`,
      token: `token_${index}_${crypto.randomUUID().split('-')[0]}`,
      expires: new Date(),
    };
  },
  passwordResetToken: (index: number) => {
    return {
      email: `${index}_${crypto.randomUUID()}@example.com`.toLowerCase(),
      token: `token_${index}_${crypto.randomUUID().split('-')[0]}`,
      expires: new Date(),
    };
  },
  invitation: (index: number) => {
    return {
      email: `${index}_${crypto.randomUUID()}@example.com`.toLowerCase(),
      token: `token_${index}_${crypto.randomUUID().split('-')[0]}`,
      role: 'EMPLOYEE',
      expires: new Date(),
    };
  },
};

export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}
