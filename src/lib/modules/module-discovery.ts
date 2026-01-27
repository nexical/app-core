
import fs from 'node:fs';
import path from 'node:path';
import { createJiti } from 'jiti';

export type ModulePhase = 'core' | 'provider' | 'feature' | 'integration' | 'theme';

export interface ModuleConfig {
    type?: ModulePhase;
    order?: number;
    [key: string]: any;
}

export interface LoadedModule {
    name: string;
    path: string;
    config: ModuleConfig;
}

const PHASE_ORDER: Record<ModulePhase, number> = {
    'core': 0,
    'provider': 10,
    'feature': 20,
    'integration': 30,
    'theme': 40
};

export class ModuleDiscovery {
    private static modulesDir = path.resolve(process.cwd(), 'modules');

    /**
     * Loads all modules from the modules directory, reads their config,
     * and returns them sorted by Phase and Order.
     */
    static async loadModules(): Promise<LoadedModule[]> {
        if (!fs.existsSync(this.modulesDir)) {
            return [];
        }

        const moduleNames = fs.readdirSync(this.modulesDir);
        const loadedModules: LoadedModule[] = [];
        const jiti = createJiti(import.meta.url);

        for (const name of moduleNames) {
            const modulePath = path.join(this.modulesDir, name);
            if (!fs.statSync(modulePath).isDirectory()) continue;

            const configPath = path.join(modulePath, 'module.config.mjs');
            let config: ModuleConfig = {};

            if (fs.existsSync(configPath)) {
                try {
                    const mod = await jiti.import(configPath) as any;
                    config = mod.default || mod || {};
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
                config
            });
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

            return (a.config.order ?? 50) - (b.config.order ?? 50);
        });
    }
}
