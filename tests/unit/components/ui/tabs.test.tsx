/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Framer motion can be tricky in tests, sometimes need to mock it or just wait
// For these tests, we mostly want to verify state changes and rendering

describe('Tabs', () => {
    it('should render correctly and switch tabs', () => {
        render(
            <Tabs defaultValue="account">
                <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                <TabsContent value="account">Account Content</TabsContent>
                <TabsContent value="password">Password Content</TabsContent>
            </Tabs>
        );

        expect(screen.getByText('Account Content')).toBeDefined();
        expect(screen.queryByText('Password Content')).toBeNull();

        const passwordTrigger = screen.getByRole('tab', { name: /password/i });
        fireEvent.click(passwordTrigger);

        expect(screen.getByText('Password Content')).toBeDefined();
        expect(screen.queryByText('Account Content')).toBeNull();
    });

    it('should work as a controlled component', () => {
        const onValueChange = vi.fn();
        const { rerender } = render(
            <Tabs value="account" onValueChange={onValueChange}>
                <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                <TabsContent value="account">Account Content</TabsContent>
                <TabsContent value="password">Password Content</TabsContent>
            </Tabs>
        );

        const passwordTrigger = screen.getByRole('tab', { name: /password/i });
        fireEvent.click(passwordTrigger);

        expect(onValueChange).toHaveBeenCalledWith('password');
        // Since it's controlled and we didn't update the value prop, it should still show account content
        expect(screen.getByText('Account Content')).toBeDefined();

        rerender(
            <Tabs value="password" onValueChange={onValueChange}>
                <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                <TabsContent value="account">Account Content</TabsContent>
                <TabsContent value="password">Password Content</TabsContent>
            </Tabs>
        );
        expect(screen.getByText('Password Content')).toBeDefined();
    });
});
