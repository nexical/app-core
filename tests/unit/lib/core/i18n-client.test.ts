/* eslint-disable */
/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockI18next = {
  isInitialized: false,
  language: 'en',
  use: vi.fn().mockReturnThis(),
  init: vi.fn().mockImplementation(function (this: any, options: any) {
    this.language = options?.lng || 'en';
    this.isInitialized = true;
    return this;
  }),
  t: vi.fn(),
};

vi.mock('i18next', () => ({
  default: mockI18next,
}));

describe('i18n-client', () => {
  beforeEach(() => {
    vi.resetModules();
    delete window.__I18N_DATA__;
    mockI18next.isInitialized = false;
    mockI18next.language = 'en';
    mockI18next.use.mockClear();
    mockI18next.init.mockClear();
  });

  it('should initialize with window data if available', async () => {
    // @ts-expect-error
    window.__I18N_DATA__ = {
      language: 'fr',
      store: { hello: 'bonjour' },
    };

    const i18n = (await import('../../../../src/lib/core/i18n-client')).default;
    expect(i18n.language).toBe('fr');
    expect(mockI18next.init).toHaveBeenCalled();
  });

  it('should handle missing window data gracefully', async () => {
    const i18n = (await import('../../../../src/lib/core/i18n-client')).default;
    expect(i18n.language).toBe('en');
    expect(mockI18next.init).toHaveBeenCalled();
  });

  it('should skip initialization if already initialized', async () => {
    mockI18next.isInitialized = true;
    const i18n = (await import('../../../../src/lib/core/i18n-client')).default;
    expect(mockI18next.init).not.toHaveBeenCalled();
  });
});
