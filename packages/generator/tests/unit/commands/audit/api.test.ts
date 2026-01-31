import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuditApiCommand } from '@nexical/generator/commands/audit/api';
import { ModuleLocator } from '@nexical/generator/lib/module-locator';
import { ModelParser } from '@nexical/generator/engine/model-parser';
import YAML from 'yaml';
import fs from 'node:fs';
import { Project } from 'ts-morph';

// Mock ora globally for this file
vi.mock('ora', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      start: vi.fn().mockReturnThis(),
      succeed: vi.fn().mockReturnThis(),
      fail: vi.fn().mockReturnThis(),
      stop: vi.fn().mockReturnThis(),
      text: '',
    })),
  };
});

describe('AuditApiCommand', () => {
  let command: AuditApiCommand;

  beforeEach(() => {
    vi.clearAllMocks();
    command = new AuditApiCommand();

    // Use spyOn for built-in fs to be more reliable
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readdirSync').mockReturnValue([]);
    vi.spyOn(fs, 'readFileSync').mockReturnValue('');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle found modules in run loop', async () => {
    const expandSpy = vi.spyOn(ModuleLocator, 'expand').mockResolvedValue(['test-api']);
    const auditSpy = vi
      .spyOn(command as unknown as { auditModule: () => Promise<string[]> }, 'auditModule')
      .mockResolvedValue(['Issue']);

    await command.run('test-api', {});

    expect(expandSpy).toHaveBeenCalled();
    expect(auditSpy).toHaveBeenCalled();
  });

  it('should handle no modules found', async () => {
    vi.spyOn(ModuleLocator, 'expand').mockResolvedValue([]);
    await command.run('none-api*', {});
  });

  describe('auditModule logic', () => {
    it('should report missing models.yaml', async () => {
      vi.spyOn(fs, 'existsSync').mockImplementation((p: unknown) => {
        if (String(p).includes('models.yaml')) return false;
        return true;
      });
      const issues = await (
        command as unknown as { auditModule: (m: string, v: boolean) => Promise<string[]> }
      ).auditModule('test-api', false);
      expect(issues).toBeDefined();
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0]).toContain('models.yaml not found');
    });

    it('should handle audit exceptions gracefully', async () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readdirSync').mockReturnValue([]);
      vi.spyOn(fs, 'readFileSync').mockImplementation((p: unknown) => {
        if (String(p).includes('models.yaml')) throw new Error('Abort');
        return '';
      });

      const issues = await (
        command as unknown as { auditModule: (m: string, v: boolean) => Promise<string[]> }
      ).auditModule('test-api', false);
      expect(issues[0]).toContain('Audit threw exception');
    });

    it('should perform full audit with code checks (including role objects and api.yaml)', async () => {
      // Setup path-aware existsSync to hit specific branches
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);

      vi.spyOn(fs, 'readdirSync').mockImplementation((p: unknown) => {
        const pathStr = String(p);
        if (pathStr.includes('src/roles')) return ['admin.ts'] as unknown as any;
        if (pathStr.endsWith('modules')) return ['test-api'] as unknown as any;
        return [] as unknown as any;
      });

      vi.spyOn(fs, 'readFileSync').mockImplementation((p: unknown) => {
        const pathStr = String(p);
        if (pathStr.includes('models.yaml'))
          return 'models: { User: { role: "admin", api: true } }';
        if (pathStr.includes('api.yaml')) return 'User: [{ path: "/me", method: "GET" }]';
        return '';
      });

      vi.spyOn(YAML, 'parse').mockImplementation((content: unknown) => {
        const contentStr = typeof content === 'string' ? content : '';
        if (contentStr.includes('models:'))
          return { models: { User: { role: 'admin', api: true } } };
        if (contentStr.includes('path:')) return { User: [{ path: '/me', method: 'GET' }] };
        return {};
      });

      vi.spyOn(ModelParser, 'parse').mockReturnValue({
        models: [{ name: 'User', db: false, api: true, fields: { id: 'String' } }],
        enums: [],
      } as unknown as any); // Keep ModelParser mock as any if complex

      // Mock Project and SourceFile
      const addFileSpy = vi.spyOn(Project.prototype, 'addSourceFileAtPath').mockReturnValue({
        getClass: () => undefined,
        getInterfaces: () => [],
        getEnums: () => [],
        getFunctions: () => [],
      } as unknown as any);

      const issues = await (
        command as unknown as { auditModule: (m: string, v: boolean) => Promise<string[]> }
      ).auditModule('test-api', false);
      expect(issues).toBeDefined();
      expect(addFileSpy).toHaveBeenCalled();
    });

    it('should report semantic errors in models.yaml', async () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readdirSync').mockReturnValue([]);
      vi.spyOn(fs, 'readFileSync').mockImplementation((p: unknown) => {
        if (String(p).includes('models.yaml')) {
          return 'models: { User: { role: { a: "r" }, fields: { name: "Unknown" } } }';
        }
        return '';
      });
      vi.spyOn(YAML, 'parse').mockImplementation((content: unknown) => {
        const contentStr = typeof content === 'string' ? content : '';
        if (contentStr.includes('models:')) {
          return {
            models: { User: { role: { a: 'r' }, fields: { name: 'Unknown' } } },
          };
        }
        return {};
      });

      const issues: string[] = await (
        command as unknown as { auditModule: (m: string, v: boolean) => Promise<string[]> }
      ).auditModule('test-api', true);

      expect(issues.some((i) => i.includes('unknown type'))).toBe(true);
      expect(issues.some((i) => i.includes('unknown role'))).toBe(true);
    });

    it('should validate db-enabled models and hit service/api builder branches', async () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readdirSync').mockReturnValue([]);
      vi.spyOn(fs, 'readFileSync').mockImplementation((p: unknown) => {
        if (String(p).includes('models.yaml')) {
          return 'models: { Post: { db: true, api: true, fields: { title: "String" } } }';
        }
        return '';
      });
      vi.spyOn(YAML, 'parse').mockImplementation((content: unknown) => {
        const contentStr = typeof content === 'string' ? content : '';
        if (contentStr.includes('Post')) {
          return {
            models: { Post: { db: true, api: true, fields: { title: 'String' } } },
          };
        }
        return {};
      });

      vi.spyOn(ModelParser, 'parse').mockReturnValue({
        models: [{ name: 'Post', db: true, api: true, fields: { title: 'String' } }],
        enums: [],
      } as unknown as any);

      // Mock Project and SourceFile
      vi.spyOn(Project.prototype, 'addSourceFileAtPath').mockReturnValue({
        getClass: () => undefined,
        getInterfaces: () => [],
        getEnums: () => [],
        getFunctions: () => [],
      } as unknown as any);

      const issues = await (
        command as unknown as { auditModule: (m: string, v: boolean) => Promise<string[]> }
      ).auditModule('test-api', false);
      expect(issues).toBeDefined();
    });
  });
});
