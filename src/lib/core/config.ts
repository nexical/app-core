import { z, type ZodObject, type ZodRawShape } from 'zod';
import { APP_VERSION } from './version';

export const getProcessEnv = (key: string) => {
  try {
    if (typeof process !== 'undefined' && process && process.env) {
      return process.env[key];
    }
  } catch {
    // Fallback for environments where process is restricted
  }
  return undefined;
};

export function createConfig<T extends ZodRawShape>(schema: ZodObject<T>) {
  const processEnv: Record<string, string | undefined> = {};
  const globalConfig =
    typeof window !== 'undefined'
      ? (window as unknown as { __APP_CONFIG__?: Record<string, string> }).__APP_CONFIG__
      : undefined;

  for (const key in schema.shape) {
    if (globalConfig && key in globalConfig) {
      // Use hydrated config if available
      processEnv[key] = globalConfig[key];
    } else {
      // Fallback to env vars (Server or Build-time replacement)
      let envVal: string | undefined = undefined;
      try {
        if (typeof import.meta !== 'undefined' && import.meta && import.meta.env) {
          envVal = import.meta.env[key];
        }
      } catch {
        // Ignored
      }

      processEnv[key] = envVal || getProcessEnv(key);
    }
  }

  const parsed = schema.safeParse(processEnv);

  if (!parsed.success) {
    const errorMsg = `Invalid configuration: ${JSON.stringify(parsed.error.format(), null, 2)}`;
    if (typeof window === 'undefined') {
      throw new Error(errorMsg);
    } else {
      console.error(errorMsg);
      // Return partial data or empty object if forced to continue in browser
      return (parsed as { data?: z.infer<typeof schema> }).data || ({} as z.infer<typeof schema>);
    }
  }

  return parsed.data;
}

const coreSchema = z.object({
  PUBLIC_SITE_NAME: z.string().default('My Application'),
  PUBLIC_SITE_VERSION: z.string().default(APP_VERSION),
  PUBLIC_API_DESCRIPTION: z.string().default('API Documentation'),
  PUBLIC_DEFAULT_LANGUAGE: z.string().default('en'),
  PUBLIC_SUPPORTED_LANGUAGES: z.string().optional(),
  PUBLIC_DOCS_PUBLIC_ACCESS: z
    .preprocess(
      (v) => (v === undefined || v === null ? 'false' : String(v).toLowerCase()),
      z.enum(['true', 'false']),
    )
    .default('false')
    .transform((v) => v === 'true'),
  PUBLIC_PRIMARY_DOMAIN: z.string().default('example.com'),
  PUBLIC_SITE_MODE: z.enum(['server', 'static']).default('server'),
  PUBLIC_DISABLE_API_DOCS: z
    .preprocess(
      (v) => (v === undefined || v === null ? 'false' : String(v).toLowerCase()),
      z.enum(['true', 'false']),
    )
    .default('false')
    .transform((v) => v === 'true'),
  PUBLIC_SITE_URL: z.string().optional(),
  PUBLIC_API_URL: z.string().min(1, 'PUBLIC_API_URL is required'),
});

export const config = createConfig(coreSchema);

export const publicConfig = (() => {
  const safeConfig: Record<string, unknown> = {};

  // 1. Auto-discover PUBLIC_ keys from parsed config (Internal Defaults)
  for (const key of Object.keys(config)) {
    if (key.startsWith('PUBLIC_')) {
      safeConfig[key] = (config as Record<string, unknown>)[key];
    }
  }

  // 2. Auto-discover PUBLIC_ keys from process.env (Server-side Runtime)
  if (typeof process !== 'undefined' && process && process.env) {
    for (const key of Object.keys(process.env)) {
      if (key.startsWith('PUBLIC_')) {
        safeConfig[key] = process.env[key];
      }
    }
  }

  return safeConfig;
})();
