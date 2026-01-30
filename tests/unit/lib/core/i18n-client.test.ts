/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('i18n-client', () => {
  beforeEach(() => {
    vi.resetModules();
    // @ts-ignore
    delete window.__I18N_DATA__;
  });

  it('should initialize with window data if available', async () => {
    // @ts-ignore
    window.__I18N_DATA__ = {
      language: 'fr',
      store: { hello: 'bonjour' },
    };

    const i18n = (await import('../../../../src/lib/core/i18n-client')).default;
    expect(i18n.language).toBe('fr');
    expect(i18n.t('hello')).toBe('bonjour');
  });

  it('should handle missing window data gracefully', async () => {
    const i18n = (await import('../../../../src/lib/core/i18n-client')).default;
    expect(i18n.isInitialized).toBe(true);
  });
});
