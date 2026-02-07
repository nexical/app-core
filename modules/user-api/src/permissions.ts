import { Permissions } from '@/lib/security/permissions';

// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
export const PermissionRegistry = {
  'user:list': {
    description: 'View list of all users',
  },
  'user:create': {
    description: 'Create a new user manually',
  },
  'user:update': {
    description: 'Update any user profile',
  },
  'user:delete': {
    description: 'Soft delete or ban a user',
  },
  'user:invite': {
    description: 'Invite new users via email',
  },
  'user:read_self': {
    description: 'View own profile',
  },
  'user:update_self': {
    description: 'Update own profile',
  },
  'auth:sudo': {
    description: 'Access administrative shells and menus',
  },
} as const;

export type PermissionAction = keyof typeof PermissionRegistry;

export const RolePermissions = {
  ADMIN: ['user:list', 'user:create', 'user:update', 'user:delete', 'user:invite', 'auth:sudo'],
  EMPLOYEE: ['user:read_self', 'user:update_self'],
  CONTRACTOR: ['user:read_self'],
} as const;

export class Permission {
  public static check(action: PermissionAction, role: string): boolean {
    return Permissions.check(action, role);
  }
}
