import { HookSystem } from '@/lib/modules/hooks';

/**
 * Example Payload Interfaces
 * MANDATORY: Avoid the 'any' type.
 */
interface UserRegisteredPayload {
  userId: string;
  email: string;
  timestamp: number;
}

interface UserConfig {
  theme: 'dark' | 'light';
  notificationsEnabled: boolean;
}

/**
 * 1. Event Registration (on)
 * Using explicit generic types for T and C.
 * Note: LIFO execution means the MOST RECENTLY registered listener runs first.
 */
HookSystem.on<UserRegisteredPayload, { source: string }>(
  'user.registered',
  async (data, context) => {
    // data is UserRegisteredPayload
    // context is { source: string } | undefined
    console.info(`User registered: ${data.email} via ${context?.source}`);
  },
);

/**
 * 2. Side-Effect Dispatch (dispatch)
 * Parallel and fire-and-forget using Promise.allSettled.
 */
export async function registerUser(userId: string, email: string) {
  const payload: UserRegisteredPayload = { userId, email, timestamp: Date.now() };

  // Dispatch parallel events to other modules (Email, Billing, Analytics)
  // Generics default to unknown if not specified.
  await HookSystem.dispatch<UserRegisteredPayload, { source: string }>('user.registered', payload, {
    source: 'web',
  });
}

/**
 * 3. Data Transformation (filter)
 * Sequential pipeline for data modification (LIFO execution).
 */
export async function loadUserConfig(rawConfig: UserConfig): Promise<UserConfig> {
  // Pass config through module pipeline
  // Each module can modify the object or opt-out by returning undefined.
  const enrichedConfig = await HookSystem.filter<UserConfig>('user.config.read', rawConfig);

  return enrichedConfig;
}

/**
 * Sequential Filter Registration
 * Demonstrating LIFO: If this is registered LAST, it runs FIRST.
 */
HookSystem.on<UserConfig>('user.config.read', (config) => {
  // Enforce dark mode for specific feature modules
  return { ...config, theme: 'dark' };
});
