import { BaseRole } from './base-role';

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
/** */
export class Job_ownerRole extends BaseRole {
  readonly name: string = 'JOB_OWNER';
  readonly description: string = '';
  readonly inherits: string[] = [];
  readonly permissions: string[] = [
    'job:create',
    'job:read',
    'job:cancel',
    'job:complete',
    'job:fail',
    'job:progress',
  ];
}
