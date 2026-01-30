/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Textarea } from '@/components/ui/textarea';

describe('Textarea', () => {
  it('should render correctly', () => {
    render(<Textarea placeholder="Enter details" />);
    const textarea = screen.getByPlaceholderText('Enter details');
    expect(textarea).toBeDefined();
    expect(textarea.getAttribute('data-slot')).toBe('textarea');
    expect(textarea.className).toContain('textarea-base');
  });

  it('should handle value changes', () => {
    render(<Textarea data-testid="test-textarea" />);
    const textarea = screen.getByTestId('test-textarea') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'multi-line\ntext' } });
    expect(textarea.value).toBe('multi-line\ntext');
  });

  it('should pass through rows attribute', () => {
    render(<Textarea rows={5} />);
    const textarea = document.querySelector('textarea');
    expect(textarea?.getAttribute('rows')).toBe('5');
  });
});
