/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ScalarDocs } from '@/components/ScalarDocs';

// Mock dependencies
vi.mock('@scalar/api-reference-react', () => ({
  ApiReferenceReact: ({ configuration }: any) => (
    <div data-testid="scalar-docs">
      <pre data-testid="scalar-config">{JSON.stringify(configuration)}</pre>
    </div>
  ),
}));

describe('ScalarDocs', () => {
  it('should render correct configuration', () => {
    const spec = { info: { title: 'Test API' } };
    render(<ScalarDocs spec={spec} />);

    const docs = screen.getByTestId('scalar-docs');
    expect(docs).toBeInTheDocument();

    const config = JSON.parse(screen.getByTestId('scalar-config').textContent || '{}');
    expect(config.content).toEqual(spec);
    expect(config.theme).toBe('purple');
  });

  it('should handle dark mode class on html element', () => {
    const spec = {};
    document.documentElement.classList.add('dark');
    render(<ScalarDocs spec={spec} />);

    const docsWrapper = screen.getByTestId('scalar-docs').parentElement;
    expect(docsWrapper).toHaveClass('dark-mode');

    document.documentElement.classList.remove('dark');
    // Note: MutationObserver mock usually required for dynamic updates,
    // but initial render check covers the logic branch.
  });
});
