import { describe, it, expect, beforeEach } from 'vitest';
import { Project, SourceFile } from 'ts-morph';
import { SdkIndexBuilder } from '../../../../src/engine/builders/sdk-index-builder';
import { type ModelDef } from '../../../../src/engine/types';

describe('SdkIndexBuilder', () => {
  let project: Project;
  let sourceFile: SourceFile;
  const models: ModelDef[] = [
    { name: 'User', api: true, default: true, fields: {} },
    { name: 'Profile', api: true, fields: {} },
  ];

  beforeEach(() => {
    project = new Project({ useInMemoryFileSystem: true });
    sourceFile = project.createSourceFile('index.ts', '');
  });

  it('should generate a main SDK class aggregating sub-SDKs', () => {
    const builder = new SdkIndexBuilder(models, 'user-api');
    builder.ensure(sourceFile);

    const text = sourceFile.getFullText();
    expect(text).toContain('export class UserSDK extends BaseUserSDK');
    expect(text).toContain('public profile: BaseProfileSDK;');
    expect(text).toContain('this.profile = new BaseProfileSDK(client);');
    expect(text).toContain('export * from "./user-sdk"');
    expect(text).toContain('export * from "./profile-sdk"');
    expect(text).toContain('export * from "./types"');
  });

  it('should handle module name without -api suffix', () => {
    const builder = new SdkIndexBuilder(models, 'custom');
    builder.ensure(sourceFile);

    expect(sourceFile.getClass('CustomSDK')).toBeDefined();
  });

  it('should use BaseResource if no default model is specified', () => {
    const noDefaultModels = models.map((m) => ({ ...m, default: false }));
    const builder = new SdkIndexBuilder(noDefaultModels, 'user-api');
    builder.ensure(sourceFile);

    const sdkClass = sourceFile.getClass('UserSDK');
    expect(sdkClass?.getExtends()?.getText()).toBe('BaseResource');
  });
});
