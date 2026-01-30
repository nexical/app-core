import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuditApiCommand } from '@nexical/generator/commands/audit/api';
import { ModuleLocator } from '@nexical/generator/lib/module-locator';
import { ModelParser } from '@nexical/generator/engine/model-parser';
import YAML from 'yaml';
import fs from 'fs-extra';
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle found modules in run loop', async () => {
    const expandSpy = vi.spyOn(ModuleLocator, 'expand').mockResolvedValue(['test-api']);
    const auditSpy = vi.spyOn(command as any, 'auditModule').mockResolvedValue(['Issue']);

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
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);
      const issues = await (command as any).auditModule('test-api', false);
      expect(issues).toBeDefined();
      expect(issues.length).toBeGreaterThan(0);
    });

    it('should handle audit exceptions gracefully', async () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readdirSync').mockReturnValue([]);
      vi.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('Abort');
      });

      const issues = await (command as any).auditModule('test-api', false);
      expect(issues[0]).toContain('Audit threw exception');
    });

    it('should perform full audit with code checks (including role objects and api.yaml)', async () => {
      // Setup path-aware existsSync to hit specific branches
      vi.spyOn(fs, 'existsSync').mockImplementation((p: any) => {
        const pathStr = p.toString();
        if (pathStr.includes('modules') && pathStr.includes('src/roles')) return true;
        if (pathStr.includes('models.yaml')) return true;
        if (pathStr.includes('api.yaml')) return true;
        if (pathStr.includes('src/sdk/index.ts')) return true;
        if (pathStr.includes('tests/integration/factory.ts')) return true;
        return false;
      });

      vi.spyOn(fs, 'readdirSync').mockImplementation((p: any) => {
        const pathStr = p.toString();
        if (pathStr.includes('modules') && pathStr.includes('src/roles'))
          return ['admin.ts'] as any;
        if (pathStr.endsWith('modules')) return ['test-api'] as any;
        return [] as any;
      });

      vi.spyOn(fs, 'readFileSync').mockImplementation((p: any) => {
        const pathStr = p.toString();
        if (pathStr.includes('models.yaml'))
          return 'models: { User: { role: "admin", api: true } }';
        if (pathStr.includes('api.yaml')) return 'User: [{ path: "/me", method: "GET" }]';
        return '';
      });

      vi.spyOn(YAML, 'parse').mockImplementation((content: string | any) => {
        const contentStr = typeof content === 'string' ? content : '';
        if (contentStr.includes('models:'))
          return { models: { User: { role: 'admin', api: true } } };
        if (contentStr.includes('path:')) return { User: [{ path: '/me', method: 'GET' }] };
        return {};
      });

      vi.spyOn(ModelParser, 'parse').mockReturnValue({
        models: [{ name: 'User', db: false, api: true, fields: { id: 'String' } }],
        enums: [],
      } as any);

      // Mock Project and SourceFile
      const addFileSpy = vi.spyOn(Project.prototype, 'addSourceFileAtPath').mockReturnValue({
        getClass: () => undefined,
        getInterfaces: () => [],
        getEnums: () => [],
        getFunctions: () => [],
      } as any);

      const issues = await (command as any).auditModule('test-api', false);
      expect(issues).toBeDefined();
      expect(addFileSpy).toHaveBeenCalled();
    });

    it('should report semantic errors in models.yaml', async () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readdirSync').mockReturnValue([]); // Prevent modules scan crash
      vi.spyOn(fs, 'readFileSync').mockReturnValue(
        'models: { User: { role: { a: "r" }, fields: { name: "Unknown" } } }',
      );
      vi.spyOn(YAML, 'parse').mockReturnValue({
        models: { User: { role: { a: 'r' }, fields: { name: 'Unknown' } } },
      });

      const issues: string[] = await (command as any).auditModule('test-api', true);

      expect(issues.some((i) => i.includes('unknown type'))).toBe(true);
      expect(issues.some((i) => i.includes('unknown role'))).toBe(true);
    });

    it('should validate db-enabled models and hit service/api builder branches', async () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readdirSync').mockReturnValue([]);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(
        'models: { Post: { db: true, api: true, fields: { title: "String" } } }',
      );
      vi.spyOn(YAML, 'parse').mockReturnValue({
        models: { Post: { db: true, api: true, fields: { title: 'String' } } },
      });

      vi.spyOn(ModelParser, 'parse').mockReturnValue({
        models: [{ name: 'Post', db: true, api: true, fields: { title: 'String' } }],
        enums: [],
      } as any);

      // Mock Project and SourceFile
      vi.spyOn(Project.prototype, 'addSourceFileAtPath').mockReturnValue({
        getClass: () => undefined,
        getInterfaces: () => [],
        getEnums: () => [],
        getFunctions: () => [],
      } as any);

      const issues = await (command as any).auditModule('test-api', false);
      expect(issues).toBeDefined();
    });
  });
});
