import { describe, it, expect, vi, beforeEach } from 'vitest';
import { roleRegistry } from '@/lib/registries/role-registry';

describe('RoleRegistry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Since it's a singleton, we might want to clear it if possible
    // But it doesn't expose a clear method.
    // We'll just be careful.
  });

  it('should register and get a policy', () => {
    const mockPolicy = { check: vi.fn() };
    roleRegistry.register('test-role', mockPolicy);
    expect(roleRegistry.get('test-role')).toBe(mockPolicy);
    expect(roleRegistry.has('test-role')).toBe(true);
  });

  it('should throw if policy not found during check', async () => {
    await expect(roleRegistry.check('Missing', {} as any, {})).rejects.toThrow(/not found/);
  });

  it('should call policy.check during check', async () => {
    const mockPolicy = { check: vi.fn().mockResolvedValue(undefined) };
    roleRegistry.register('active-role', mockPolicy);

    await roleRegistry.check('active-role', { locals: {} } as any, { id: 1 }, { data: 2 });

    expect(mockPolicy.check).toHaveBeenCalledWith({ locals: {} }, { id: 1 }, { data: 2 });
  });

  it('should warn when overwriting a policy', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    roleRegistry.register('dup', { check: vi.fn() });
    roleRegistry.register('dup', { check: vi.fn() });

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Overwriting role policy'));
  });
});
