/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import integration from '@/lib/integrations/module-styles-integration';
import fs from 'node:fs';

vi.mock('node:fs', () => ({
    default: {
        existsSync: vi.fn(),
        readdirSync: vi.fn(),
    },
}));

describe('module-styles-integration', () => {
    const injectScript = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should inject Core and Module CSS', () => {
        const inst = integration();
        vi.mocked(fs.existsSync).mockImplementation((p: any) => {
            if (p.endsWith('src/styles/styles.css')) return true;
            if (p.endsWith('modules/mod1/styles.css')) return true;
            if (p.endsWith('modules')) return true;
            return false;
        });
        vi.mocked(fs.readdirSync).mockReturnValue(['mod1', 'mod2'] as any);

        const hook = inst.hooks['astro:config:setup'] as any;
        hook({ injectScript });

        expect(injectScript).toHaveBeenCalledWith('page', expect.stringContaining('src/styles/styles.css'));
        expect(injectScript).toHaveBeenCalledWith('page', expect.stringContaining('modules/mod1/styles.css'));
        expect(injectScript).not.toHaveBeenCalledWith('page', expect.stringContaining('modules/mod2/styles.css'));
    });

    it('should handle missing modules directory', () => {
        const inst = integration();
        vi.mocked(fs.existsSync).mockReturnValue(false);

        const hook = inst.hooks['astro:config:setup'] as any;
        hook({ injectScript });

        expect(injectScript).not.toHaveBeenCalled();
    });
});
