/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

describe('Avatar', () => {
    it('should render fallback initially (as Radix waits for image load)', () => {
        render(
            <Avatar>
                <AvatarImage src="test.jpg" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
            </Avatar>
        );

        // In JSDOM without real image loading, Radix defaults to fallback
        const fallback = screen.getByText('JD');
        expect(fallback).toBeDefined();
        expect(fallback.getAttribute('data-slot')).toBe('avatar-fallback');
    });

    it('should render fallback when no image is provided', () => {
        render(
            <Avatar>
                <AvatarFallback>FB</AvatarFallback>
            </Avatar>
        );

        const fallback = screen.getByText('FB');
        expect(fallback).toBeDefined();
        expect(fallback.getAttribute('data-slot')).toBe('avatar-fallback');
    });
});
