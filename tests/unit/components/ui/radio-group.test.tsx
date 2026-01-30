/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

describe('RadioGroup', () => {
  it('should render correctly and handle changes', () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup defaultValue="option-1" onValueChange={onValueChange}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-1" id="r1" />
          <label htmlFor="r1">Option 1</label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-2" id="r2" />
          <label htmlFor="r2">Option 2</label>
        </div>
      </RadioGroup>,
    );

    const option1 = screen.getByLabelText('Option 1');
    const option2 = screen.getByLabelText('Option 2');

    expect(option1.getAttribute('aria-checked')).toBe('true');
    expect(option2.getAttribute('aria-checked')).toBe('false');

    fireEvent.click(option2);
    expect(onValueChange).toHaveBeenCalledWith('option-2');
    expect(option2.getAttribute('aria-checked')).toBe('true');
  });
});
