import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Project } from 'ts-morph';
import { GuardBuilder } from '../../../../../src/engine/builders/ui/guard-builder.js';
import * as fs from 'node:fs';

vi.mock('node:fs');

describe('GuardBuilder', () => {
  let project: Project;

  beforeEach(() => {
    project = new Project({ useInMemoryFileSystem: true });
    vi.resetAllMocks();
  });

  it('should generate guards', async () => {
    // Mock ui.yaml and api.yaml
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockImplementation((path) => {
      const p = String(path);
      if (p.includes('ui.yaml')) return 'backend: "user-api"';
      if (p.includes('api.yaml')) {
        return `
User:
  - verb: GET
    path: /admin-data
    roles: [ADMIN, MANAGER]
`;
      }
      return '';
    });

    const builder = new GuardBuilder('test-ui', { name: 'test-ui' });
    await builder.build(project, undefined);

    const files = project.getSourceFiles();
    expect(files.length).toBeGreaterThan(0);

    const genericGuard = files.find((f) => f.getFilePath().includes('RoleGuard.tsx'));
    expect(genericGuard).toBeDefined();

    const adminGuard = files.find((f) => f.getFilePath().includes('AdminGuard.tsx'));
    expect(adminGuard).toBeDefined();
    expect(adminGuard?.getFullText()).toContain("roles={['ADMIN']}");

    const managerGuard = files.find((f) => f.getFilePath().includes('ManagerGuard.tsx'));
    expect(managerGuard).toBeDefined();
  });
});
