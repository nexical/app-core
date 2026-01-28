import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Formatter } from '@nexical/generator/utils/formatter';
import prettier from 'prettier';

// Explicit mock factory for default export
const formatMock = vi.fn();
const resolveConfigFileMock = vi.fn();
const resolveConfigMock = vi.fn();

vi.mock('prettier', () => ({
    default: {
        format: (...args: any[]) => formatMock(...args),
        resolveConfigFile: (...args: any[]) => resolveConfigFileMock(...args),
        resolveConfig: (...args: any[]) => resolveConfigMock(...args)
    }
}));

describe('Formatter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset static state for testing using cast to any to access private property
        (Formatter as any).hasCheckedConfig = false;
        (Formatter as any).configCache = null;
    });

    it('should resolve config if found', async () => {
        resolveConfigFileMock.mockResolvedValue('/path/to/.prettierrc');
        resolveConfigMock.mockResolvedValue({ printWidth: 100 });
        formatMock.mockResolvedValue('formatted');

        await Formatter.format('raw', 'test.ts');

        expect(resolveConfigFileMock).toHaveBeenCalledWith('test.ts');
        expect(resolveConfigMock).toHaveBeenCalledWith('/path/to/.prettierrc');
        expect(formatMock).toHaveBeenCalledWith('raw', expect.objectContaining({ printWidth: 100 }));
    });

    it('should format content using prettier', async () => {
        formatMock.mockResolvedValue('formatted');

        const result = await Formatter.format('raw', 'test.ts');
        expect(result).toBe('formatted');
        expect(formatMock).toHaveBeenCalledWith('raw', expect.objectContaining({ filepath: 'test.ts', parser: 'typescript' }));
    });

    it('should infer parser from extension', async () => {
        formatMock.mockResolvedValue('formatted');

        await Formatter.format('{}', 'test.json');
        expect(formatMock).toHaveBeenCalledWith('{}', expect.objectContaining({ parser: 'json' }));
    });

    it('should fallback to original content on error', async () => {
        formatMock.mockRejectedValue(new Error('Format failed'));

        const result = await Formatter.format('raw', 'test.ts');
        expect(result).toBe('raw');
    });
});
