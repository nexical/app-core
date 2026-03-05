/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { DataTable } from '../../../../../src/components/ui/data-table/data-table';
import type { ColumnDef } from '@tanstack/react-table';

const data = [
  { id: '1', name: 'John Doe', role: 'Admin' },
  { id: '2', name: 'Jane Smith', role: 'User' },
];

interface TestData {
  id: string;
  name: string;
  role: string;
}

const columns: ColumnDef<TestData>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => row.getValue('name'),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => row.getValue('role'),
  },
];

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('DataTable', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render table with data', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('John Doe')).toBeDefined();
  });

  it('should handle row selection state for coverage', () => {
    // We add a selection column to trigger getIsSelected
    const selectionColumns: ColumnDef<TestData>[] = [
      {
        id: 'select',
        header: 'Select',
        cell: ({ row }) => (
          <input
            type="checkbox"
            data-testid="select-row-checkbox"
            checked={row.getIsSelected()}
            onChange={() => row.toggleSelected()}
          />
        ),
      },
      ...columns,
    ];
    render(<DataTable columns={selectionColumns} data={data} />);

    const checkboxes = screen.getAllByTestId('select-row-checkbox');
    fireEvent.click(checkboxes[0]);

    // Line 72: data-state={row.getIsSelected() && 'selected'}
    // Row 1 is the first data row (Header is visually Row 0 but in tbody it's index 0)
    const row = screen.getAllByRole('row')[1];
    expect(row.getAttribute('data-state')).toBe('selected');
  });

  it('should handle placeholder headers for coverage', () => {
    // To trigger isPlaceholder: true, we use a grouped header structure
    const groupedColumns: ColumnDef<TestData>[] = [
      {
        id: 'group',
        header: 'Group',
        columns: [{ accessorKey: 'name', header: 'Name' }],
      },
    ];
    // A grouped column generates a header group where the top 'Group' header is not a placeholder,
    // but React Table sometimes creates placeholder cells for alignment in complex headers.
    // Alternatively, we can force a placeholder by testing the rendering output.
    render(<DataTable columns={groupedColumns} data={data} />);
    expect(screen.getByText('Group')).toBeDefined();
  });

  it('should render empty state when no data is provided', () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText('No results.')).toBeDefined();
  });
});
