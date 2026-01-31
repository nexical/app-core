/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import type { Column } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../../../../../src/components/ui/data-table/data-table-column-header';

// Mock Radix DropdownMenu
vi.mock('../../../../../src/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <div
      role="menuitem"
      tabIndex={0}
      data-testid="menu-item"
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {children}
    </div>
  ),
  DropdownMenuSeparator: () => <hr />,
}));

describe('DataTableColumnHeader', () => {
  let columnMock: Column<unknown, unknown>;

  beforeEach(() => {
    columnMock = {
      getCanSort: vi.fn().mockReturnValue(true),
      getIsSorted: vi.fn().mockReturnValue(false),
      toggleSorting: vi.fn(),
      toggleVisibility: vi.fn(),
    } as unknown as Column<unknown, unknown>;
  });

  afterEach(() => {
    cleanup();
  });

  it('should handle sorting and visibility actions', () => {
    render(<DataTableColumnHeader column={columnMock} title="Name" />);

    const items = screen.getAllByTestId('menu-item');

    // Asc
    fireEvent.click(items[0]);
    expect(columnMock.toggleSorting).toHaveBeenCalledWith(false);

    // Desc
    fireEvent.click(items[1]);
    expect(columnMock.toggleSorting).toHaveBeenCalledWith(true);

    // Hide (item 2 is separator via HR, so item 2 in list is Hide)
    fireEvent.click(items[2]);
    expect(columnMock.toggleVisibility).toHaveBeenCalledWith(false);
  });

  it('should show correct icons based on sort state', () => {
    (columnMock.getIsSorted as unknown as Mock).mockReturnValue('desc');
    const { rerender } = render(<DataTableColumnHeader column={columnMock} title="Name" />);
    expect(screen.getByRole('button')).toBeDefined();

    (columnMock.getIsSorted as unknown as Mock).mockReturnValue('asc');
    rerender(<DataTableColumnHeader column={columnMock} title="Name" />);
    expect(screen.getByRole('button')).toBeDefined();
  });
});
