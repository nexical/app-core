/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select';

describe('Select', () => {
    it('should show content when trigger is clicked', async () => {
        render(
            <Select defaultValue="apple">
                <SelectTrigger>
                    <SelectValue placeholder="Select a fruit" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="banana">Banana</SelectItem>
                </SelectContent>
            </Select>
        );

        const trigger = screen.getByRole('combobox');

        // Radix UI Select requires pointer events in JSDOM
        fireEvent.pointerDown(trigger, { pointerId: 1, pointerType: 'mouse' });
        fireEvent.pointerUp(trigger, { pointerId: 1, pointerType: 'mouse' });
        fireEvent.click(trigger);

        // Use findByText for anything in the portal
        // selected item appears in trigger AND in listbox
        const appleItems = await screen.findAllByText('Apple');
        expect(appleItems.length).toBeGreaterThan(0);

        expect(await screen.findByText('Banana')).toBeDefined();
    });
});
