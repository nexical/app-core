/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Tooltip, TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

describe('Tooltip', () => {
    it('should render children and content (initially invisible)', () => {
        render(
            <Tooltip content="Tooltip Text" side="right" className="custom-tooltip">
                <button>Hover Me</button>
            </Tooltip>
        );

        expect(screen.getByText('Hover Me')).toBeDefined();
        const content = screen.getByText('Tooltip Text');
        expect(content).toHaveClass('invisible');
        expect(content).toHaveClass('opacity-0');
        expect(content.parentElement).toHaveClass('custom-tooltip');
    });

    it('should render Radix-style wrappers correctly', () => {
        render(
            <TooltipProvider>
                <TooltipRoot content="Text">
                    <TooltipTrigger><button>Btn</button></TooltipTrigger>
                    <TooltipContent>Unused in this lightweight impl</TooltipContent>
                </TooltipRoot>
            </TooltipProvider>
        );
        expect(screen.getByText('Btn')).toBeDefined();
    });
});
