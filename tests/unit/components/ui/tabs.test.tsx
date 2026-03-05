/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

describe('Tabs', () => {
  it('should render correctly and switch tabs', () => {
    render(
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account"> Account </TabsTrigger>
          <TabsTrigger value="password"> Password </TabsTrigger>
        </TabsList>
        <TabsContent value="account"> Account Content </TabsContent>
        <TabsContent value="password"> Password Content </TabsContent>
      </Tabs>,
    );

    expect(screen.getByText('Account Content')).toBeDefined();
    const passwordTrigger = screen.getByRole('tab', { name: /password/i });
    fireEvent.click(passwordTrigger);
    expect(screen.getByText('Password Content')).toBeDefined();
  });

  it('should respect defaultValue and handle empty state', () => {
    render(
      <Tabs defaultValue="tab2">
        <TabsList>
          <TabsTrigger value="tab1"> Tab 1 </TabsTrigger>
          <TabsTrigger value="tab2"> Tab 2 </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1"> Content 1 </TabsContent>
        <TabsContent value="tab2"> Content 2 </TabsContent>
      </Tabs>,
    );

    expect(screen.getByText('Content 2')).toBeVisible();

    // Test with NO values at all (branch 28 fallback to '')
    const { container } = render(
      <Tabs>
        <TabsList>
          <div />
        </TabsList>
      </Tabs>,
    );
    expect(container).toBeInTheDocument();
  });

  it('should work as a controlled component', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Tabs value="account" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="account"> Account </TabsTrigger>
          <TabsTrigger value="password"> Password </TabsTrigger>
        </TabsList>
        <TabsContent value="account"> Account Content </TabsContent>
      </Tabs>,
    );

    const passwordTrigger = screen.getByRole('tab', { name: /password/i });
    fireEvent.click(passwordTrigger);

    expect(onValueChange).toHaveBeenCalledWith('password');
    expect(screen.getByText('Account Content')).toBeDefined();

    rerender(
      <Tabs value="password" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="account"> Account </TabsTrigger>
          <TabsTrigger value="password"> Password </TabsTrigger>
        </TabsList>
        <TabsContent value="password"> Password Content </TabsContent>
      </Tabs>,
    );
    expect(screen.getByText('Password Content')).toBeDefined();
  });
});
