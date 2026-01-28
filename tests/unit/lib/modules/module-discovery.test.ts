/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModuleDiscovery } from '@/lib/modules/module-discovery';
import fs from 'node:fs';
import { createJiti } from 'jiti';

const { mockJiti } = vi.hoisted(() => ({
    mockJiti: {
        import: vi.fn()
    }
}));

vi.mock('node:fs', () => ({
    default: {
        existsSync: vi.fn(),
        readdirSync: vi.fn(),
        statSync: vi.fn(),
    }
}));

vi.mock('jiti', () => ({
    createJiti: vi.fn().mockReturnValue(mockJiti)
}));

describe('ModuleDiscovery', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockJiti.import.mockReset();
    });

    it('should return empty list if modules directory does not exist', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);
        const modules = await ModuleDiscovery.loadModules();
        expect(modules).toEqual([]);
    });

    it('should discover and sort modules correctly', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readdirSync).mockReturnValue(['mod-b' as any, 'mod-a' as any]);
        vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

        mockJiti.import.mockImplementation(async (path) => {
            if (path.includes('mod-b')) return { default: { type: 'core', order: 1 } };
            if (path.includes('mod-a')) return { default: { type: 'feature', order: 10 } };
            return {};
        });

        const modules = await ModuleDiscovery.loadModules();

        expect(modules).toHaveLength(2);
        expect(modules[0].name).toBe('mod-b'); // Core before feature
        expect(modules[1].name).toBe('mod-a');
    });

    it('should apply defaults if config is missing or fails to load', async () => {
        vi.mocked(fs.existsSync).mockImplementation((path: string) => path.endsWith('modules')); // Only modules dir exists
        vi.mocked(fs.readdirSync).mockReturnValue(['no-config' as any]);
        vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

        const modules = await ModuleDiscovery.loadModules();
        expect(modules[0].config.type).toBe('feature');
        expect(modules[0].config.order).toBe(50);
    });

    it('should handle config load errors gracefully', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readdirSync).mockReturnValue(['bad-config' as any]);
        vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

        mockJiti.import.mockRejectedValue(new Error('Syntax Error'));

        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        const modules = await ModuleDiscovery.loadModules();
        expect(modules).toHaveLength(1);
        expect(warnSpy).toHaveBeenCalled();

        warnSpy.mockRestore();
    });
});
