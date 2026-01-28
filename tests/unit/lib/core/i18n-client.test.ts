/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use a hoisted state to share with the mock
const state = vi.hoisted(() => ({
    isInitialized: false
}));

vi.mock('i18next', () => {
    const i18n = {
        get isInitialized() { return state.isInitialized; },
        set isInitialized(val) { state.isInitialized = val; },
        use: vi.fn().mockReturnThis(),
        init: vi.fn().mockImplementation(function (this: any) {
            state.isInitialized = true;
            return Promise.resolve();
        }),
    };
    return { default: i18n };
});

vi.mock('react-i18next', () => ({
    initReactI18next: { type: '3rdParty', init: vi.fn() }
}));

describe('i18n-client', () => {
    beforeEach(async () => {
        vi.resetModules();
        vi.clearAllMocks();
        state.isInitialized = false;
        // Reset window state
        if (typeof window !== 'undefined') {
            (window as any).__I18N_DATA__ = undefined;
        }
    });

    it('should initialize with defaults if no data on window', async () => {
        const i18next = (await import('i18next')).default;
        await import('@/lib/core/i18n-client');

        expect(i18next.init).toHaveBeenCalledWith(expect.objectContaining({
            lng: 'en',
            fallbackLng: 'en'
        }));
    });

    it('should initialize with data from window if available', async () => {
        const i18next = (await import('i18next')).default;
        (window as any).__I18N_DATA__ = {
            language: 'fr',
            store: { 'hello': 'bonjour' }
        };

        // Fresh import to trigger the logic
        await import('@/lib/core/i18n-client');

        expect(i18next.init).toHaveBeenCalledWith(expect.objectContaining({
            lng: 'fr',
            resources: {
                fr: {
                    translation: { 'hello': 'bonjour' }
                }
            }
        }));
    });
});
