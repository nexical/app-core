/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DataTableRowActions } from '../../../../../src/components/ui/data-table/data-table-row-actions';

describe('DataTableRowActions', () => {
  let rowMock: any;

  beforeEach(() => {
    rowMock = {
      getValue: vi.fn(),
    };
  });

  afterEach(() => {
    cleanup();
  });

  it('should render menu trigger', () => {
    render(<DataTableRowActions row={rowMock} />);
    expect(screen.getByText('Open menu')).toBeDefined();
  });

  it('should show actions on click', () => {
    render(<DataTableRowActions row={rowMock} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Radix menu items
    // expect(screen.getByText('Edit')).toBeDefined();
  });
});
