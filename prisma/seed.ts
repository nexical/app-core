import { db as prisma } from '../src/lib/core/db';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modulesDir = path.resolve(__dirname, '../modules');

export async function seed() {
  console.info('Starting database seeding...');

  if (fs.existsSync(modulesDir)) {
    const modules = fs.readdirSync(modulesDir);
    for (const moduleName of modules) {
      const seedPath = path.join(modulesDir, moduleName, 'prisma/seed.ts');
      if (fs.existsSync(seedPath)) {
        try {
          // Convert path to file URL for dynamic import on Windows/Linux consistency
          const seedFileUrl = pathToFileURL(seedPath).href;
          const moduleSeed = await import(seedFileUrl);
          if (moduleSeed.seed && typeof moduleSeed.seed === 'function') {
            await moduleSeed.seed(prisma);
          } else {
            console.warn(`Module ${moduleName} has a seed.ts but no export "seed" function.`);
          }
        } catch (e) {
          console.error(`Failed to seed module: ${moduleName}`, e);
        }
      }
    }
  }

  console.info('Database seeding completed.');
}

// Execute if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
