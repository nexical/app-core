/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
} from '@/components/ui/table';

describe('Table Components', () => {
    it('should render a full table structure correctly', () => {
        render(
            <Table className="custom-table">
                <TableCaption>A list of recent invoices.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Invoice</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-medium">INV001</TableCell>
                        <TableCell>Paid</TableCell>
                    </TableRow>
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell className="text-right">$250.00</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        );

        expect(screen.getByText('A list of recent invoices.')).toBeDefined();
        expect(screen.getByText('Invoice')).toHaveClass('table-head');
        expect(screen.getByText('INV001')).toHaveClass('table-cell');
        expect(screen.getByText('Total')).toBeDefined();

        const table = document.querySelector('table');
        expect(table).toHaveClass('custom-table');
        expect(table?.parentElement).toHaveClass('table-wrapper');
    });
});
