/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('should render correctly with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeDefined();
    expect(button.getAttribute('data-variant')).toBe('default');
    expect(button.getAttribute('data-size')).toBe('default');
  });

  it('should explicitly render as button when asChild is false', () => {
    render(<Button asChild={false}>Explicit Button</Button>);
    const button = screen.getByRole('button', { name: /explicit button/i });
    expect(button.tagName.toLowerCase()).toBe('button');
  });

  it('should apply variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button', { name: /delete/i });
    expect(button.getAttribute('data-variant')).toBe('destructive');
    expect(button.className).toContain('btn-destructive');
  });

  it('should apply size classes', () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole('button', { name: /small/i });
    expect(button.getAttribute('data-size')).toBe('sm');
    expect(button.className).toContain('btn-size-sm');
  });

  it('should render as a custom component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: /link button/i });
    expect(link).toBeDefined();
    expect(link.getAttribute('data-slot')).toBe('button');
  });

  it('should pass through additional props', () => {
    render(
      <Button data-testid="test-btn" disabled>
        Disabled
      </Button>,
    );
    const button = screen.getByTestId('test-btn');
    expect(button).toBeDisabled();
  });
});
