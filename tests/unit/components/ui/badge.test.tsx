/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '@/components/ui/badge';

describe('Badge', () => {
    it('should render correctly with default props', () => {
        render(<Badge>New</Badge>);
        const badge = screen.getByText('New');
        expect(badge).toBeDefined();
        expect(badge.getAttribute('data-slot')).toBe('badge');
        expect(badge.className).toContain('badge-default');
    });

    it('should apply variant classes', () => {
        render(<Badge variant="destructive">Error</Badge>);
        const badge = screen.getByText('Error');
        expect(badge.className).toContain('badge-destructive');
    });

    it('should render as a custom component when asChild is true', () => {
        render(
            <Badge asChild>
                <a href="/test">Link Badge</a>
            </Badge>
        );
        const link = screen.getByRole('link', { name: /link badge/i });
        expect(link).toBeDefined();
        expect(link.getAttribute('data-slot')).toBe('badge');
    });
});
