import type { AstroIntegration } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Standard Astro Integration Template
 * Responsible for dynamic discovery and injection of module assets.
 */
export default function createIntegration(): AstroIntegration {
  const INTEGRATION_NAME = 'custom-integration';

  return {
    name: INTEGRATION_NAME,
    hooks: {
      'astro:config:setup': ({ injectScript, updateConfig: _updateConfig }) => {
        console.info(`[${INTEGRATION_NAME}] Initializing...`);

        try {
          // Define module root relative to project root
          // Use path.resolve for robust resolution of top-level project directories
          const modulesDir = path.resolve(process.cwd(), 'apps/frontend/modules');

          if (!fs.existsSync(modulesDir)) {
            console.warn(`[${INTEGRATION_NAME}] Modules directory not found at ${modulesDir}`);
            return;
          }

          // Dynamic Discovery Logic
          const modules = fs.readdirSync(modulesDir).filter((file) => {
            return fs.statSync(path.resolve(modulesDir, file)).isDirectory();
          });

          /**
           * NOTE: For integrations requiring specific loading orders (Themes overriding Features),
           * consider using the ModuleDiscovery utility to process modules in Phased order.
           *
           * Example (if ModuleDiscovery is available):
           * const discovered = ModuleDiscovery.loadModules(modulesDir);
           */

          console.info(`[${INTEGRATION_NAME}] Discovered ${modules.length} modules.`);

          // Example: Iterate and process
          for (const moduleName of modules) {
            console.info(`[${INTEGRATION_NAME}] Scanning module: ${moduleName}`);
            // const configPath = path.resolve(modulesDir, moduleName, 'module.config.mjs');
            // Check existence and process...
          }

          // Example: Injection
          // injectScript('page', `console.log("Injected by ${INTEGRATION_NAME}");`);
          // Using injectScript is mandatory for Vite-compatible processing (HMR, CSS processing).

          // Suppress unused variable warning for template purposes if not used
          void injectScript;
        } catch (error) {
          console.error(`[${INTEGRATION_NAME}] Fatal error during setup:`, error);
        }
      },
    },
  };
}
