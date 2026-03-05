/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LanguageSelector } from '@/components/system/LanguageSelector';

// Mock react-i18next
const mockI18n = {
  language: 'en',
  changeLanguage: vi.fn(),
  options: {
    supportedLngs: ['en', 'fr', 'de', 'cimode'],
  },
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: mockI18n,
    t: (key: string) => key,
  }),
}));

// Mock Select components
vi.mock('@/components/ui/select', () => ({
  Select: ({
    children,
    onValueChange,
  }: {
    children: React.ReactNode;
    onValueChange: (v: string) => void;
    value?: string;
  }) => (
    <button type="button" {...{ 'data-testid': 'select-mock' }} onClick={() => onValueChange('fr')}>
      {children}
    </button>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div {...{ 'data-testid': 'trigger' }}> {children} </div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => <div>{placeholder} </div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children} </div>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div {...{ 'data-testid': `item-${value}` }}> {children} </div>
  ),
}));

describe('LanguageSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockI18n.options.supportedLngs = ['en', 'fr', 'de', 'cimode'];
    mockI18n.language = 'en';
  });

  it('should render nothing if only one language is available', () => {
    mockI18n.options.supportedLngs = ['en', 'cimode'];
    const { container } = render(<LanguageSelector />);
    expect(container.firstChild).toBeNull();
  });

  it('should render nothing if supportedLngs is not an array', () => {
    mockI18n.options.supportedLngs = null as unknown as string[];
    const { container } = render(<LanguageSelector />);
    expect(container.firstChild).toBeNull();
  });

  it('should render the selector when multiple languages are available', () => {
    render(<LanguageSelector />);
    expect(screen.getByTestId('select-mock')).toBeInTheDocument();
  });

  it('should handle language change', () => {
    render(<LanguageSelector />);
    const select = screen.getByTestId('select-mock');

    act(() => {
      fireEvent.click(select);
    });

    expect(mockI18n.changeLanguage).toHaveBeenCalledWith('fr');
    expect(document.cookie).toContain('i18next=fr');
  });
});
