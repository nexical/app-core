import type { AstroIntegration } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

import { ModuleDiscovery } from '../modules/module-discovery';

/**
 * Astro integration to automatically load pages and API endpoints from modules.
 *
 * This integration scans the `modules/` directory for any `src/pages` subdirectories
 * and injects them into the Astro build using the `injectRoute` API.
 * It supports both `.astro` pages and `.ts` API endpoints.
 */
export default (): AstroIntegration => {
  return {
    name: 'module-pages-integration',
    hooks: {
      'astro:config:setup': async ({ injectRoute }) => {
        const modules = await ModuleDiscovery.loadModules();

        for (const module of modules) {
          const modulePagesDir = path.join(module.path, 'src/pages');

          if (fs.existsSync(modulePagesDir) && fs.statSync(modulePagesDir).isDirectory()) {
            // Recursive function to find all page files
            const scanPages = (dir: string, baseRoute: string) => {
              const files = fs.readdirSync(dir);

              for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);

                if (stat.isDirectory()) {
                  scanPages(filePath, `${baseRoute}/${file}`);
                } else if (
                  file.endsWith('.astro') ||
                  file.endsWith('.ts') ||
                  file.endsWith('.js')
                ) {
                  // Construct the route pattern
                  // Remove file extension
                  let routePattern = `${baseRoute}/${file.replace(/\.(astro|ts|js)$/, '')}`;

                  // Handle index routes
                  if (routePattern.endsWith('/index')) {
                    routePattern = routePattern.replace('/index', '') || '/';
                  }

                  // Handled above: routePattern starts with / because baseRoute or initial separator
                  injectRoute({
                    pattern: routePattern,
                    entrypoint: filePath,
                  });
                  console.log(`[module-pages] Injected route: ${routePattern} from ${module.name}`);
                }
              }
            };

            // Start scanning from the module's pages directory
            scanPages(modulePagesDir, '');
          }
        }
      },
    },
  };
};
