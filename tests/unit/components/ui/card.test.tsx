/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

describe('Card Component Tree', () => {
  it('should render all card sub-components correctly', () => {
    render(
      <Card className="custom-card">
        <CardHeader className="custom-header">
          <CardTitle className="custom-title">Title</CardTitle>
          <CardDescription className="custom-desc">Description</CardDescription>
          <CardAction className="custom-action">Action</CardAction>
        </CardHeader>
        <CardContent className="custom-content">Content</CardContent>
        <CardFooter className="custom-footer">Footer</CardFooter>
      </Card>,
    );

    // Using data-slot as selectors
    expect(document.querySelector('[data-slot="card"]')).toHaveClass('custom-card');
    expect(document.querySelector('[data-slot="card-header"]')).toHaveClass('custom-header');
    expect(document.querySelector('[data-slot="card-title"]')).toHaveClass('custom-title');
    expect(document.querySelector('[data-slot="card-description"]')).toHaveClass('custom-desc');
    expect(document.querySelector('[data-slot="card-action"]')).toHaveClass('custom-action');
    expect(document.querySelector('[data-slot="card-content"]')).toHaveClass('custom-content');
    expect(document.querySelector('[data-slot="card-footer"]')).toHaveClass('custom-footer');

    expect(screen.getByText('Title')).toBeDefined();
    expect(screen.getByText('Description')).toBeDefined();
    expect(screen.getByText('Action')).toBeDefined();
    expect(screen.getByText('Content')).toBeDefined();
    expect(screen.getByText('Footer')).toBeDefined();
  });
});
