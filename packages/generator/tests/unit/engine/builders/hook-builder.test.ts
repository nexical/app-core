import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Project } from 'ts-morph';
import { HookBuilder } from '../../../../src/engine/builders/hook-builder.js';
import * as fs from 'node:fs';

vi.mock('node:fs');

describe('HookBuilder', () => {
  let project: Project;

  beforeEach(() => {
    project = new Project({ useInMemoryFileSystem: true });
    vi.resetAllMocks();
  });

  it('should generate hook files from config', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockImplementation((path) => {
      if (String(path).endsWith('hooks.yaml')) {
        return `
hooks:
  - event: "user.registered"
    action: "sendWelcomeEmail"
  - event: "user.read"
    filter: true
    action: "enrichData"
`;
      }
      return '';
    });

    const builder = new HookBuilder('test-api', { name: 'test-api' });
    await builder.build(project, undefined);

    const onFile = project.getSourceFile('src/hooks/user-registered-sendWelcomeEmail.ts');
    expect(onFile).toBeDefined();
    const onText = onFile?.getFullText();
    expect(onText).toContain('HookSystem.on("user.registered"');
    expect(onText).toContain('export async function init()');

    const filterFile = project.getSourceFile('src/hooks/user-read-enrichData.ts');
    expect(filterFile).toBeDefined();
    const filterText = filterFile?.getFullText();
    expect(filterText).toContain('HookSystem.filter("user.read"');
  });
});
