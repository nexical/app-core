import type { ApiClient } from './client';

export type ActorProvider = (client: ApiClient, params: unknown) => Promise<unknown>;

export class ActorRegistry {
  private providers: Map<string, ActorProvider> = new Map();
  private loaded = false;

  async loadProviders() {
    if (this.loaded) return;

    // Dynamic import of all actors.ts files in modules
    const modules = import.meta.glob(
      [
        '../../../modules/**/tests/integration/actors.ts',
        '../../../modules/**/tests/integration/manual-actors.ts',
      ],
      { eager: true },
    );

    for (const path in modules) {
      const mod = modules[path] as { actors?: Record<string, ActorProvider> };
      if (mod.actors) {
        for (const [key, provider] of Object.entries(mod.actors)) {
          this.register(key, provider as ActorProvider);
        }
      }
    }

    this.loaded = true;
  }

  register(name: string, provider: ActorProvider) {
    this.providers.set(name, provider);
  }

  async getProvider(name: string): Promise<ActorProvider> {
    await this.loadProviders();
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(
        `Actor provider "${name}" not found. Ensure it is exported in a module's actors.ts file.`,
      );
    }
    return provider;
  }
}

export const Registry = new ActorRegistry();
