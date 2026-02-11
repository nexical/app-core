import { describe, it, expect } from 'vitest';
import { Permissions } from '@/lib/security/permissions';

describe('Permissions', () => {
  it('should register and check permissions correctly', () => {
    Permissions.register('ADMIN', ['user:read', 'user:write']);

    expect(Permissions.check('user:read', 'ADMIN')).toBe(true);
    expect(Permissions.check('user:write', 'ADMIN')).toBe(true);
    expect(Permissions.check('user:delete', 'ADMIN')).toBe(false);
  });

  it('should return false for unknown roles', () => {
    expect(Permissions.check('user:read', 'UNKNOWN')).toBe(false);
  });

  it('should append actions to existing roles', () => {
    Permissions.register('USER', ['post:read']);
    expect(Permissions.check('post:read', 'USER')).toBe(true);
    expect(Permissions.check('post:write', 'USER')).toBe(false);

    Permissions.register('USER', ['post:write']);
    expect(Permissions.check('post:read', 'USER')).toBe(true);
    expect(Permissions.check('post:write', 'USER')).toBe(true);
  });
});
