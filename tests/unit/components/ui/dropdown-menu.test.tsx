/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';

describe('DropdownMenu', () => {
    it('should show content when trigger is clicked', async () => {
        render(
            <DropdownMenu>
                <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Label</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Item 1</DropdownMenuItem>
                    <DropdownMenuCheckboxItem checked>Checkbox Item</DropdownMenuCheckboxItem>
                    <DropdownMenuRadioGroup value="1" onValueChange={() => { }}>
                        <DropdownMenuRadioItem value="1">Radio 1</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Sub Menu</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>Sub Content</DropdownMenuSubContent>
                    </DropdownMenuSub>
                </DropdownMenuContent>
            </DropdownMenu>
        );

        const trigger = screen.getByText('Open Menu');
        // Radix UI often requires pointerDown + pointerUp to trigger opening in JSDOM
        fireEvent.pointerDown(trigger, {
            pointerId: 1,
            pointerType: 'mouse',
        });
        fireEvent.pointerUp(trigger, {
            pointerId: 1,
            pointerType: 'mouse',
        });
        // Click is also often needed as a fallback
        fireEvent.click(trigger);

        expect(await screen.findByText('Label')).toBeDefined();
        expect(screen.getByText('Item 1')).toBeDefined();
    });
});
