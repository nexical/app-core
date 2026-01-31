/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import type { Table } from '@tanstack/react-table';
import { DataTableToolbar } from '../../../../../src/components/ui/data-table/data-table-toolbar';

describe('DataTableToolbar', () => {
  let tableMock: Table<unknown>;

  beforeEach(() => {
    tableMock = {
      getState: vi.fn().mockReturnValue({
        columnFilters: [],
      }),
      getColumn: vi.fn().mockReturnValue({
        getFilterValue: vi.fn().mockReturnValue(''),
        setFilterValue: vi.fn(),
      }),
      resetColumnFilters: vi.fn(),
      getAllColumns: vi.fn().mockReturnValue([]),
    } as unknown as Table<unknown>;
  });

  afterEach(() => {
    cleanup();
  });

  it('should render input and handle filtering', () => {
    render(<DataTableToolbar table={tableMock} />);

    const input = screen.getByPlaceholderText('Filter...');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(tableMock.getColumn).toHaveBeenCalledWith('name');
    expect(tableMock.getColumn('name')!.setFilterValue).toHaveBeenCalledWith('test');
  });

  it('should show reset button when filtered', () => {
    (tableMock.getState as unknown as Mock).mockReturnValue({
      columnFilters: [{ id: 'name', value: 'test' }],
    });
    render(<DataTableToolbar table={tableMock} />);

    const resetButton = screen.getByText('Reset');
    expect(resetButton).toBeDefined();

    fireEvent.click(resetButton);
    expect(tableMock.resetColumnFilters).toHaveBeenCalled();
  });
});
