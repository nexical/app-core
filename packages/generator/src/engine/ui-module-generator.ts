import { ModuleGenerator } from './module-generator.js';
import { FormBuilder } from './builders/ui/form-builder.js';
import { TableBuilder } from './builders/ui/table-builder.js';
import { type ModuleConfig } from './types.js';

export class UiModuleGenerator extends ModuleGenerator {
  async run(): Promise<void> {
    const config = {
      type: 'feature',
      order: 100,
    } as unknown as ModuleConfig; // Defaults, as we don't strictly parsing module.config.mjs here yet

    console.info(`[UiModuleGenerator] Running for ${this.moduleName}`);

    // Track initial files to diff later
    const initialFiles = new Set(this.project.getSourceFiles().map((f) => f.getFilePath()));

    // Run Builders
    await new FormBuilder(this.moduleName, config).build(this.project, undefined);
    await new TableBuilder(this.moduleName, config).build(this.project, undefined);

    // Register newly created files
    const finalFiles = this.project.getSourceFiles();
    for (const file of finalFiles) {
      if (!initialFiles.has(file.getFilePath())) {
        this.generatedFiles.add(file.getFilePath());
        console.log(`[UiModuleGenerator] [ADD_SET] ${file.getFilePath()}`);
      }
    }

    await this.saveAll();
  }
}
