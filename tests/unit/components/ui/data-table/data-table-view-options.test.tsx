/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Table, Column } from '@tanstack/react-table';
import { DataTableViewOptions } from '../../../../../src/components/ui/data-table/data-table-view-options';

// Mock Radix DropdownMenu to expose content immediately
vi.mock('../../../../../src/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuCheckboxItem: ({
    children,
    checked,
    onCheckedChange,
  }: {
    children: React.ReactNode;
    checked: boolean;
    onCheckedChange: (c: boolean) => void;
  }) => (
    <div
      role="menuitemcheckbox"
      aria-checked={checked}
      tabIndex={0}
      data-testid="column-item"
      onClick={() => onCheckedChange(!checked)}
      onKeyDown={(e) => e.key === 'Enter' && onCheckedChange(!checked)}
    >
      {children}
    </div>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
}));

describe('DataTableViewOptions', () => {
  let tableMock: Table<unknown>;

  beforeEach(() => {
    tableMock = {
      getAllColumns: vi.fn().mockReturnValue([
        {
          id: 'name',
          accessorFn: () => {},
          getCanHide: () => true,
          getIsVisible: () => true,
          toggleVisibility: vi.fn(),
        },
        {
          id: 'role',
          accessorFn: () => {},
          getCanHide: () => true,
          getIsVisible: () => false,
          toggleVisibility: vi.fn(),
        },
        { id: 'id', getCanHide: () => false }, // Should be filtered out
      ]),
    } as unknown as Table<unknown>;
  });

  afterEach(() => {
    cleanup();
  });

  it('should render trigger button and all hideable columns', () => {
    render(<DataTableViewOptions table={tableMock} />);
    expect(screen.getByText('View')).toBeDefined();

    // Due to our mock, items are rendered immediately
    expect(screen.getByText('name')).toBeDefined();
    expect(screen.getByText('role')).toBeDefined();
    expect(screen.queryByText('id')).toBeNull();
  });

  it('should toggle column visibility when clicked', () => {
    render(<DataTableViewOptions table={tableMock} />);

    const columnItems = screen.getAllByTestId('column-item');
    fireEvent.click(columnItems[0]); // name (visible -> hidden)

    const nameColumn = tableMock
      .getAllColumns()
      .find((c: Column<unknown, unknown>) => c.id === 'name');
    expect(nameColumn!.toggleVisibility).toHaveBeenCalledWith(false);
  });
});
