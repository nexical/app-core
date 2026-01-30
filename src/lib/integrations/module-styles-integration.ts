import type { AstroIntegration } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

const MODULES_DIR = path.resolve(process.cwd(), 'modules');

/**
 * Astro integration to automatically discover and inject modular CSS.
 */
export default (): AstroIntegration => {
  return {
    name: 'module-styles-integration',
    hooks: {
      'astro:config:setup': ({ injectScript }) => {
        const coreStylesPath = path.resolve(process.cwd(), 'src/styles/styles.css');
        if (fs.existsSync(coreStylesPath)) {
          injectScript('page', `import "${coreStylesPath}";`);
          console.log(`[module-styles] Injected Core CSS from src/styles/styles.css`);
        }

        if (!fs.existsSync(MODULES_DIR)) return;

        const modules = fs.readdirSync(MODULES_DIR);

        for (const moduleName of modules) {
          const stylesPath = path.join(MODULES_DIR, moduleName, 'styles.css');
          if (fs.existsSync(stylesPath)) {
            // Inject the CSS file directly into the client-side head via a script import
            // This ensures Vite handles the CSS correctly with hot-reloading
            injectScript('page', `import "${stylesPath}";`);
            console.log(`[module-styles] Injected CSS from ${moduleName}`);
          }
        }
      },
    },
  };
};
