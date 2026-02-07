import { Permissions } from '@/lib/security/permissions';

// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
export const PermissionRegistry = {
  'job:create': {
    description: 'Create a new job',
  },
  'job:read': {
    description: 'Read job details',
  },
  'job:cancel': {
    description: 'Cancel a pending/running job',
  },
  'job:complete': {
    description: 'Mark a job as completed',
  },
  'job:fail': {
    description: 'Mark a job as failed',
  },
  'job:progress': {
    description: 'Update job progress',
  },
  'job:read_all': {
    description: 'View all jobs across the system',
  },
  'agent:read_all': {
    description: 'View all registered agents',
  },
  'system:maintain': {
    description: 'Perform system maintenance (stale checks)',
  },
} as const;

export type PermissionAction = keyof typeof PermissionRegistry;

export const RolePermissions = {
  JOB_OWNER: ['job:create', 'job:read', 'job:cancel', 'job:complete', 'job:fail', 'job:progress'],
  ADMIN: ['job:read_all', 'agent:read_all', 'system:maintain'],
} as const;

export class Permission {
  public static check(action: PermissionAction, role: string): boolean {
    return Permissions.check(action, role);
  }
}
