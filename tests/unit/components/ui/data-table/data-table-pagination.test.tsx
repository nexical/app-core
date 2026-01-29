/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DataTablePagination } from '../../../../../src/components/ui/data-table/data-table-pagination';

// Mock Radix Select to expose onValueChange
vi.mock('../../../../../src/components/ui/select', () => ({
    Select: ({ children, onValueChange, value }: any) => (
        <div data-testid="mock-select" onClick={() => onValueChange("20")}>
            {children}
        </div>
    ),
    SelectTrigger: ({ children }: any) => <div>{children}</div>,
    SelectValue: ({ placeholder }: any) => <div>{placeholder}</div>,
    SelectContent: ({ children }: any) => <div>{children}</div>,
    SelectItem: ({ children, value }: any) => <div data-testid={`item-${value}`}>{children}</div>,
}));

describe('DataTablePagination', () => {
    let tableMock: any;

    beforeEach(() => {
        tableMock = {
            getState: vi.fn().mockReturnValue({
                pagination: { pageIndex: 0, pageSize: 10 }
            }),
            getFilteredSelectedRowModel: vi.fn().mockReturnValue({ rows: [] }),
            getFilteredRowModel: vi.fn().mockReturnValue({ rows: [{}, {}] }),
            getPageCount: vi.fn().mockReturnValue(2),
            getCanPreviousPage: vi.fn().mockReturnValue(false),
            getCanNextPage: vi.fn().mockReturnValue(true),
            setPageSize: vi.fn(),
            setPageIndex: vi.fn(),
            previousPage: vi.fn(),
            nextPage: vi.fn(),
        };
    });

    afterEach(() => {
        cleanup();
    });

    it('should render selected rows info', () => {
        tableMock.getFilteredSelectedRowModel.mockReturnValue({ rows: [{}] });
        render(<DataTablePagination table={tableMock} />);
        expect(screen.getByText(/1 of 2 row\(s\) selected/)).toBeDefined();
    });

    it('should handle page size change via mocked select', () => {
        render(<DataTablePagination table={tableMock} />);
        const select = screen.getByTestId('mock-select');
        fireEvent.click(select); // Triggers our mock onValueChange("20")
        expect(tableMock.setPageSize).toHaveBeenCalledWith(20);
    });

    it('should handle all navigation buttons', () => {
        tableMock.getCanPreviousPage.mockReturnValue(true);
        tableMock.getCanNextPage.mockReturnValue(true);

        render(<DataTablePagination table={tableMock} />);

        const firstButton = screen.getByRole('button', { name: /Go to first page/i });
        fireEvent.click(firstButton);
        expect(tableMock.setPageIndex).toHaveBeenCalledWith(0);

        const prevButton = screen.getByRole('button', { name: /Go to previous page/i });
        fireEvent.click(prevButton);
        expect(tableMock.previousPage).toHaveBeenCalled();

        const nextButton = screen.getByRole('button', { name: /Go to next page/i });
        fireEvent.click(nextButton);
        expect(tableMock.nextPage).toHaveBeenCalled();

        const lastButton = screen.getByRole('button', { name: /Go to last page/i });
        fireEvent.click(lastButton);
        expect(tableMock.setPageIndex).toHaveBeenCalledWith(1);
    });

    it('should disable buttons based on state', () => {
        tableMock.getCanPreviousPage.mockReturnValue(false);
        tableMock.getCanNextPage.mockReturnValue(false);

        render(<DataTablePagination table={tableMock} />);

        const prevButton = screen.getByRole('button', { name: /Go to previous page/i });
        expect(prevButton.hasAttribute('disabled')).toBe(true);

        const nextButton = screen.getByRole('button', { name: /Go to next page/i });
        expect(nextButton.hasAttribute('disabled')).toBe(true);
    });
});
