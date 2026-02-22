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
          const modulesDir = path.join(process.cwd(), 'apps/frontend/modules');

          if (!fs.existsSync(modulesDir)) {
            console.warn(`[${INTEGRATION_NAME}] Modules directory not found at ${modulesDir}`);
            return;
          }

          // Dynamic Discovery Logic
          const modules = fs.readdirSync(modulesDir).filter((file) => {
            return fs.statSync(path.join(modulesDir, file)).isDirectory();
          });

          console.info(`[${INTEGRATION_NAME}] Discovered ${modules.length} modules.`);

          // Example: Iterate and process
          for (const moduleName of modules) {
            console.debug(`[${INTEGRATION_NAME}] Scanning module: ${moduleName}`);
            // const configPath = path.join(modulesDir, moduleName, 'module.config.mjs');
            // Check existence and process...
          }

          // Example: Injection
          // injectScript('page', `console.log("Injected by ${INTEGRATION_NAME}");`);
          // To use injectScript, ensure it is used in the code or prefixed with _ in arguments if unused.
          // Since it's destructured above, we keep it available for the template.

          // Suppress unused variable warning for template purposes if not used
          void injectScript;
        } catch (error) {
          console.error(`[${INTEGRATION_NAME}] Fatal error during setup:`, error);
        }
      },
    },
  };
}
