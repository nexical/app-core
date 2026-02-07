import auth from 'auth-astro';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  type: 'feature',
  order: 5,
  integrations: [
    auth({
      configFile: path.join(__dirname, 'auth.config'),
    }),
  ],
  vite: {
    optimizeDeps: {
      include: ['zxcvbn'],
    },
  },
};
