import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Project } from 'ts-morph';
import { RegistryBuilder } from '../../../../../src/engine/builders/ui/registry-builder.js';
import * as fs from 'node:fs';

vi.mock('node:fs');

describe('RegistryBuilder', () => {
  let project: Project;

  beforeEach(() => {
    project = new Project({ useInMemoryFileSystem: true });
    vi.resetAllMocks();
  });

  it('should generate navigation registry', async () => {
    // Mock ui.yaml
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(`
navigation:
  label: "Test Module"
  icon: "Settings"
`);

    const builder = new RegistryBuilder('test-ui', { name: 'test-ui' });
    await builder.build(project, undefined);

    const sourceFile = project.getSourceFile('src/registry/navigation.tsx');
    expect(sourceFile).toBeDefined();

    const text = sourceFile?.getFullText();
    expect(text).toContain('export const navigation');
    expect(text).toContain("label: 'Test Module'");
    expect(text).toContain("icon: 'Settings'");
  });
});
