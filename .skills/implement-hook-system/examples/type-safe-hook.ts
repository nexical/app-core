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
 * Parallel and fire-and-forget.
 */
export async function registerUser(userId: string, email: string) {
  const payload: UserRegisteredPayload = { userId, email, timestamp: Date.now() };

  // Dispatch parallel events to other modules (Email, Billing, Analytics)
  await HookSystem.dispatch<UserRegisteredPayload, { source: string }>('user.registered', payload, {
    source: 'web',
  });
}

/**
 * 3. Data Transformation (filter)
 * Sequential pipeline for data modification.
 */
export async function loadUserConfig(rawConfig: UserConfig): Promise<UserConfig> {
  // Pass config through module pipeline
  // Each module can modify the object
  const enrichedConfig = await HookSystem.filter<UserConfig>('user.config.read', rawConfig);

  return enrichedConfig;
}

/**
 * Sequential Filter Registration
 */
HookSystem.on<UserConfig>('user.config.read', (config) => {
  // Enforce dark mode for specific feature modules
  return { ...config, theme: 'dark' };
});
