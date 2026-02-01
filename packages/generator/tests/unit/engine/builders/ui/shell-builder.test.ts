import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Project } from 'ts-morph';
import { ShellBuilder } from '../../../../../src/engine/builders/ui/shell-builder.js';
import * as fs from 'node:fs';

vi.mock('node:fs');

describe('ShellBuilder', () => {
  let project: Project;

  beforeEach(() => {
    project = new Project({ useInMemoryFileSystem: true });
    vi.resetAllMocks();
  });

  it('should generate module shell', async () => {
    // Mock ui.yaml
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue('');

    const builder = new ShellBuilder('test-ui', { name: 'test-ui' });
    await builder.build(project, undefined);

    const sourceFile = project.getSourceFile('src/components/layout/ModuleShell.tsx');
    expect(sourceFile).toBeDefined();

    const text = sourceFile?.getFullText();
    expect(text).toContain('export const ModuleShell');
    expect(text).toContain('AuthProvider');
  });
});
