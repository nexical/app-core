/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

describe('Sheet', () => {
    it('should show content when trigger is clicked', async () => {
        render(
            <Sheet>
                <SheetTrigger>Open Sheet</SheetTrigger>
                <SheetContent side="left">
                    <SheetHeader>
                        <SheetTitle>Sheet Title</SheetTitle>
                        <SheetDescription>Sheet Description</SheetDescription>
                    </SheetHeader>
                    <div>Sheet Content</div>
                </SheetContent>
            </Sheet>
        );

        const trigger = screen.getByText('Open Sheet');
        fireEvent.click(trigger);

        expect(await screen.findByText('Sheet Title')).toBeDefined();
        expect(screen.getByText('Sheet Description')).toBeDefined();
        expect(screen.getByText('Sheet Content')).toBeDefined();

        const content = document.querySelector('[data-slot="sheet-content"]');
        expect(content).toHaveClass('sheet-content-left');
    });
});
