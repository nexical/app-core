/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DataTable } from '@/components/ui/data-table/data-table';
import { ColumnDef } from '@tanstack/react-table';

// Simple data and columns for testing
const data = [
    { id: '1', name: 'John Doe', role: 'Admin' },
    { id: '2', name: 'Jane Smith', role: 'User' },
];

const columns: ColumnDef<any>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => row.getValue('name')
    },
    {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => row.getValue('role')
    },
];

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

describe('DataTable', () => {
    it('should render table with data', () => {
        render(<DataTable columns={columns} data={data} />);

        expect(screen.getByText('Name')).toBeDefined();
        expect(screen.getByText('John Doe')).toBeDefined();
        expect(screen.getByText('Jane Smith')).toBeDefined();
    });

    it('should show "No results." when data is empty', () => {
        render(<DataTable columns={columns} data={[]} />);
        expect(screen.getByText('No results.')).toBeDefined();
    });

    it('should handle search/toolbar filtering', () => {
        render(<DataTable columns={columns} data={data} />);
        const input = screen.getByPlaceholderText('Filter...');
        fireEvent.change(input, { target: { value: 'John' } });

        expect(screen.getByText('John Doe')).toBeDefined();
        expect(screen.queryByText('Jane Smith')).toBeNull();
    });
});
