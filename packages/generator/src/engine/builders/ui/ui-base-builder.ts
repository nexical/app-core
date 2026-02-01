import { BaseBuilder } from '../base-builder.js';
import {
  type ModuleConfig,
  type ModelDef,
  type NodeContainer,
  type FileDefinition,
} from '../../types.js';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

export interface UiConfig {
  backend?: string;
  prefix?: string;
  navigation?: {
    label?: string;
    icon?: string;
    parent?: string;
  };
}

export abstract class UiBaseBuilder extends BaseBuilder {
  protected uiConfig: UiConfig = {};

  constructor(
    protected moduleName: string,
    protected config: ModuleConfig,
  ) {
    super();
  }

  // Dummy implementation of abstract method from BaseBuilder as UI builders often iterate multiple files
  protected getSchema(node?: NodeContainer): FileDefinition {
    throw new Error(
      'UiBaseBuilder subclasses often manage their own file generation loop. Use build() or override getSchema().',
    );
  }

  protected loadUiConfig() {
    if (!this.moduleName) {
      console.warn('[UiBaseBuilder] moduleName is undefined, skipping UI config load');
      return;
    }
    const configPath = join(process.cwd(), 'modules', this.moduleName, 'ui.yaml');
    if (existsSync(configPath)) {
      try {
        const content = readFileSync(configPath, 'utf8');
        this.uiConfig = parse(content) as UiConfig;
      } catch {
        console.warn(`[UiBaseBuilder] Failed to parse ui.yaml for ${this.moduleName}`);
      }
    }
  }

  protected resolveModels(): ModelDef[] {
    const targetModule = this.uiConfig.backend || this.moduleName;
    const modelsPath = join(process.cwd(), 'modules', targetModule, 'models.yaml');

    if (!existsSync(modelsPath)) {
      // Fallback or warning?
      // If pure UI module without models, maybe fine to have empty models.
      // But usually we need models.
      // console.warn(`[UiBaseBuilder] No models.yaml found for ${targetModule}`);
      return [];
    }

    try {
      const content = readFileSync(modelsPath, 'utf8');
      const parsed = parse(content) as Record<string, unknown>;
      return Object.entries(parsed).map(([name, def]) => ({
        name,
        ...(def as Record<string, unknown>),
      })) as ModelDef[];
    } catch {
      return [];
    }
  }

  protected resolveRoutes(): unknown[] {
    const targetModule = this.uiConfig.backend || this.moduleName;
    const apiPath = join(process.cwd(), 'modules', targetModule, 'api.yaml');

    if (!existsSync(apiPath)) {
      return [];
    }

    try {
      const content = readFileSync(apiPath, 'utf8');
      const parsed = parse(content) as Record<string, unknown>;
      // api.yaml structure: User: [routes]
      // Flatten to list of routes with model info
      const routes: unknown[] = [];
      Object.entries(parsed).forEach(([modelName, modelRoutes]) => {
        if (Array.isArray(modelRoutes)) {
          modelRoutes.forEach((route) => {
            routes.push({ ...(route as Record<string, unknown>), modelName });
          });
        }
      });
      return routes;
    } catch {
      return [];
    }
  }
}
