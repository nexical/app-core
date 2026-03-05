/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from '@/components/ui/select';

describe('Select', () => {
  it('should show content when trigger is clicked', async () => {
    render(
      <Select defaultValue="apple">
        <SelectTrigger>
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple"> Apple </SelectItem>
          <SelectItem value="banana"> Banana </SelectItem>
        </SelectContent>
      </Select>,
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.pointerDown(trigger, { pointerId: 1, pointerType: 'mouse' });
    fireEvent.pointerUp(trigger, { pointerId: 1, pointerType: 'mouse' });
    fireEvent.click(trigger);

    // Use regex to match text regardless of whitespace
    const appleItems = await screen.findAllByText(/Apple/i);
    expect(appleItems.length).toBeGreaterThan(0);

    const options = await screen.findAllByRole('option', {}, { timeout: 2000 });
    expect(options.length).toBeGreaterThan(0);
    expect(options[1]).toHaveTextContent(/Banana/i);
  });

  it('should support popper position and custom labels', async () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select fruit" />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectGroup>
            <SelectLabel>Fruits </SelectLabel>
            <SelectItem value="apple"> Apple </SelectItem>
          </SelectGroup>
          <SelectSeparator />
        </SelectContent>
      </Select>,
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    expect(screen.getByText('Fruits')).toBeInTheDocument();
    const separator = document.querySelector('[data-slot="select-separator"]');
    expect(separator).toBeInTheDocument();
  });

  it('should render with group, label, and separator', async () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits </SelectLabel>
            <SelectItem value="apple"> Apple </SelectItem>
            <SelectSeparator />
            <SelectItem value="banana"> Banana </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.pointerDown(trigger, { pointerId: 1, pointerType: 'mouse' });
    fireEvent.pointerUp(trigger, { pointerId: 1, pointerType: 'mouse' });
    fireEvent.click(trigger);

    expect(await screen.findByText(/Fruits/i)).toBeInTheDocument();

    // Find separator by data-slot or class since role="separator" might not be assigned by Radix Select.Separator
    const separator = document.querySelector('[data-slot="select-separator"]');
    expect(separator).toBeInTheDocument();
  });
});
