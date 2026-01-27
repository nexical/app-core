import type { Page, BrowserContext } from '@playwright/test';
import { Factory } from '@tests/integration/lib/factory';

export class Actor {
    public readonly page: Page;
    public readonly context: BrowserContext;
    public readonly data = Factory;

    private static actorCache: Record<string, Function> = {};

    constructor(page: Page, context: BrowserContext) {
        this.page = page;
        this.context = context;
    }

    /**
     * Authenticates as a specific actor type.
     * This uses the integration test factory to create the user/team in the DB,
     * and then logs them in via browser session or API.
     * 
     * @param actorKey - The key of the actor module (e.g., 'user', 'team')
     * @param params - Parameters for the actor factory
     * @param options - Options like { gotoRoot: true } to navigate to home after login
     */
    async as<T = any>(actorKey: string, params: any = {}, options: { gotoRoot?: boolean } = {}): Promise<T> {
        let actorDef = Actor.actorCache[actorKey];

        if (!actorDef) {
            try {
                const { globby } = await import('globby');
                const path = await import('path');

                // Find all actor definition files
                const files = await globby('modules/*/tests/e2e/actors.ts', {
                    cwd: process.cwd(),
                    absolute: true
                });

                // Iterate and look for the specific actorKey
                for (const file of files) {
                    const mod = await import(file);
                    if (mod.actors && mod.actors[actorKey]) {
                        actorDef = mod.actors[actorKey];
                        Actor.actorCache[actorKey] = actorDef;
                        break;
                    }
                }
            } catch (error) {
                console.error(`Failed to load actor definition for '${actorKey}':`, error);
                throw error;
            }
        }

        if (!actorDef) {
            throw new Error(`Actor '${actorKey}' not found. Ensure it is exported in a 'modules/*/tests/e2e/actors.ts' file.`);
        }

        const result = await actorDef(this, params);

        if (options.gotoRoot) {
            await this.page.goto('/');
        }

        return result;
    }

    /**
     * Helper to bypass UI login by setting a session cookie.
     */
    async loginWithSession(userId: string) {
        // Placeholder for direct session injection if supported by auth provider
    }
}
