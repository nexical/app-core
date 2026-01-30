/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NavProvider, useNavData } from '../../../../src/lib/ui/nav-context';

const TestComponent = () => {
  const data = useNavData();
  return <div data-testid="nav-data">{JSON.stringify(data.context)}</div>;
};

describe('NavContext', () => {
  it('should provide data through context', () => {
    const value = { context: { projectId: '123' } };
    render(
      <NavProvider value={value}>
        <TestComponent />
      </NavProvider>,
    );

    expect(screen.getByTestId('nav-data').textContent).toBe('{"projectId":"123"}');
  });

  it('should throw error if used outside provider', () => {
    // Prevent console.error clutter from expected error
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow('useNavData must be used within a NavProvider');

    consoleError.mockRestore();
  });
});
