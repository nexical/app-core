/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from '@/components/ui/drawer';

describe('Drawer', () => {
    it('should show content when trigger is clicked', async () => {
        render(
            <Drawer>
                <DrawerTrigger>Open Drawer</DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Drawer Title</DrawerTitle>
                        <DrawerDescription>Drawer Description</DrawerDescription>
                    </DrawerHeader>
                    <div>Drawer Content</div>
                </DrawerContent>
            </Drawer>
        );

        const trigger = screen.getByText('Open Drawer');
        fireEvent.click(trigger);

        expect(await screen.findByText('Drawer Title')).toBeDefined();
        expect(screen.getByText('Drawer Description')).toBeDefined();
        expect(screen.getByText('Drawer Content')).toBeDefined();
    });
});
