import fs from 'node:fs';
import path from 'node:path';
import { createJiti } from 'jiti';

export type ModulePhase = 'core' | 'provider' | 'feature' | 'integration' | 'theme';

export interface ModuleConfig {
  type?: ModulePhase;
  order?: number;
  [key: string]: unknown;
}

export interface LoadedModule {
  name: string;
  path: string;
  config: ModuleConfig;
}

const PHASE_ORDER: Record<ModulePhase, number> = {
  core: 0,
  provider: 10,
  feature: 20,
  integration: 30,
  theme: 40,
};

export class ModuleDiscovery {
  private static modulesDir = path.resolve(process.cwd(), 'modules');

  /**
   * Loads all modules from the modules directory, reads their config,
   * and returns them sorted by Phase and Order.
   */
  static async loadModules(): Promise<LoadedModule[]> {
    const loadedModules: LoadedModule[] = [];
    const cwd = process.cwd();

    /* v8 ignore start */
    try {
      const globConfigs = import.meta.glob('/modules/*/module.config.mjs', { eager: true });
      if (Object.keys(globConfigs).length > 0) {
        for (const configPath in globConfigs) {
          const mod = globConfigs[configPath] as { default?: ModuleConfig };
          const config = (mod.default || mod || {}) as ModuleConfig;

          // Extract module name from path: /modules/{name}/module.config.mjs
          const parts = configPath.split('/');
          const name = parts[parts.indexOf('modules') + 1] || 'unknown';

          // Apply Defaults
          if (!config.type) config.type = 'feature';
          if (config.order === undefined) config.order = 50;

          // Resolve absolute path for FS operations
          // Vite glob paths starting with / are relative to project root
          const relativePath = configPath.startsWith('/') ? configPath.slice(1) : configPath;
          const absolutePath = path.resolve(cwd, relativePath).replace('/module.config.mjs', '');

          loadedModules.push({
            name,
            path: absolutePath,
            config,
          });
        }

        if (loadedModules.length > 0) {
          return this.sortModules(loadedModules);
        }
      }
    } catch (e) {
      console.warn('[ModuleDiscovery] Vite Glob detection failed, falling back to FS...', e);
    }
    /* v8 ignore stop */

    // 2. Fallback to FS (For CLI/Scripts)
    if (typeof fs !== 'undefined' && fs.existsSync && fs.existsSync(this.modulesDir)) {
      const moduleNames = fs.readdirSync(this.modulesDir);
      const jiti = createJiti(import.meta.url);

      for (const name of moduleNames) {
        const modulePath = path.join(this.modulesDir, name);
        if (!fs.statSync(modulePath).isDirectory()) continue;

        const configPath = path.join(modulePath, 'module.config.mjs');
        let config: ModuleConfig = {};

        if (fs.existsSync(configPath)) {
          try {
            const mod = (await jiti.import(configPath)) as { default?: ModuleConfig };
            config = (mod.default ?? mod) as ModuleConfig;
          } catch (e) {
            console.warn(`[ModuleDiscovery] Failed to load config for ${name}:`, e);
          }
        }

        // Apply Defaults
        if (!config.type) config.type = 'feature';
        if (config.order === undefined) config.order = 50;

        loadedModules.push({
          name,
          path: modulePath,
          config,
        });
      }
    }

    return this.sortModules(loadedModules);
  }

  /**
   * Sorts modules based on Phase (Low to High) and then Order (Low to High).
   */
  private static sortModules(modules: LoadedModule[]): LoadedModule[] {
    return modules.sort((a, b) => {
      const phaseA = PHASE_ORDER[a.config.type as ModulePhase] ?? 20;
      const phaseB = PHASE_ORDER[b.config.type as ModulePhase] ?? 20;

      if (phaseA !== phaseB) {
        return phaseA - phaseB;
      }

      /* v8 ignore start */
      return (a.config.order ?? 50) - (b.config.order ?? 50);
      /* v8 ignore stop */
    });
  }
}
