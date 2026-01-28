/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import stylesIntegration from '@/lib/integrations/module-styles-integration';
import fs from 'node:fs';
import path from 'node:path';

vi.mock('node:fs');
vi.mock('node:path', async () => {
    const actual = await vi.importActual('node:path') as any;
    return {
        ...actual,
        resolve: vi.fn((...args) => actual.join(...args)),
    };
});

describe('module-styles-integration', () => {
    const injectScript = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should inject core styles if they exist', () => {
        vi.mocked(fs.existsSync).mockImplementation((p: string) => p.includes('styles.css'));

        const integration = stylesIntegration();
        const setup = (integration.hooks as any)['astro:config:setup'];

        setup({ injectScript });

        expect(injectScript).toHaveBeenCalledWith('page', expect.stringContaining('styles.css'));
    });

    it('should discover and inject module styles', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readdirSync).mockReturnValue(['auth-mod'] as any);

        const integration = stylesIntegration();
        const setup = (integration.hooks as any)['astro:config:setup'];

        setup({ injectScript });

        expect(injectScript).toHaveBeenCalledWith('page', expect.stringContaining('modules/auth-mod/styles.css'));
    });

    it('should skip if modules directory does not exist', () => {
        vi.mocked(fs.existsSync).mockImplementation((p: string) => !p.includes('modules'));

        const integration = stylesIntegration();
        const setup = (integration.hooks as any)['astro:config:setup'];

        setup({ injectScript });

        expect(fs.readdirSync).not.toHaveBeenCalled();
    });
});
