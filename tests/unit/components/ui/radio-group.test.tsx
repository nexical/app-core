/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

describe('RadioGroup', () => {
  it('should render and change value when uncontrolled', () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup defaultValue="1" onValueChange={onValueChange}>
        <RadioGroupItem value="1" aria-label="Option 1" />
        <RadioGroupItem value="2" aria-label="Option 2" />
      </RadioGroup>,
    );

    const option2 = screen.getByLabelText('Option 2');
    fireEvent.click(option2);

    expect(onValueChange).toHaveBeenCalledWith('2');
    expect(option2).toHaveAttribute('aria-checked', 'true');
  });

  it('should behave correctly when controlled', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <RadioGroup value="1" onValueChange={onValueChange}>
        <RadioGroupItem value="1" aria-label="Option 1" />
        <RadioGroupItem value="2" aria-label="Option 2" />
      </RadioGroup>,
    );

    const option2 = screen.getByLabelText('Option 2');
    fireEvent.click(option2);

    // Should call onValueChange but NOT change internal state yet (controlled)
    expect(onValueChange).toHaveBeenCalledWith('2');
    expect(option2).toHaveAttribute('aria-checked', 'false');

    rerender(
      <RadioGroup value="2" onValueChange={onValueChange}>
        <RadioGroupItem value="1" aria-label="Option 1" />
        <RadioGroupItem value="2" aria-label="Option 2" />
      </RadioGroup>,
    );
    expect(option2).toHaveAttribute('aria-checked', 'true');
  });
});
