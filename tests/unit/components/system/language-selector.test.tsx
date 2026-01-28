/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LanguageSelector } from '@/components/system/LanguageSelector';
import { useTranslation } from 'react-i18next';

vi.mock('react-i18next', () => ({
    useTranslation: vi.fn(),
}));

describe('LanguageSelector', () => {
    const changeLanguage = vi.fn();
    const i18n = {
        language: 'en',
        options: {
            supportedLngs: ['en', 'fr', 'cimode'],
        },
        changeLanguage,
    };

    beforeEach(() => {
        vi.mocked(useTranslation).mockReturnValue({ i18n } as any);
        document.cookie = '';
    });

    it('should render correctly and change language', async () => {
        render(<LanguageSelector />);

        const trigger = screen.getByTestId('language-selector-trigger');

        fireEvent.pointerDown(trigger, { pointerId: 1, pointerType: 'mouse' });
        fireEvent.pointerUp(trigger, { pointerId: 1, pointerType: 'mouse' });
        fireEvent.click(trigger);

        const frItem = await screen.findByTestId('language-selector-item-fr');
        fireEvent.click(frItem);

        expect(changeLanguage).toHaveBeenCalledWith('fr');
        expect(document.cookie).toContain('i18next=fr');
    });

    it('should return null if only one language supported', () => {
        vi.mocked(useTranslation).mockReturnValue({
            i18n: { ...i18n, options: { supportedLngs: ['en'] } }
        } as any);
        const { container } = render(<LanguageSelector />);
        expect(container.firstChild).toBeNull();
    });
});
