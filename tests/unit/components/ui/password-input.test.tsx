/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PasswordInput } from '@/components/ui/password-input';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock zxcvbn to control strength scores
const mockZxcvbn = vi.fn();
vi.mock('zxcvbn', () => ({
  default: (val: string) => mockZxcvbn(val),
}));

describe('PasswordInput', () => {
  it('should toggle password visibility', () => {
    const { container } = render(<PasswordInput />);
    const input = container.querySelector('input') as HTMLInputElement;
    const toggle = screen.getByRole('button');

    expect(input.type).toBe('password');
    fireEvent.click(toggle);
    expect(input.type).toBe('text');
  });

  it('should handle change without strength props', () => {
    const onChange = vi.fn();
    const { container } = render(<PasswordInput onChange={onChange} />);
    const input = container.querySelector('input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'password' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('should cover all strength levels in getStrengthColor and getStrengthLabel', () => {
    const onScoreChange = vi.fn();
    const { container, rerender } = render(
      <PasswordInput showStrengthMeter onScoreChange={onScoreChange} value="p" />,
    );
    const input = container.querySelector('input') as HTMLInputElement;

    const testScores = [0, 1, 2, 3, 4, 5]; // 5 is default case
    testScores.forEach((score) => {
      mockZxcvbn.mockReturnValue({
        score,
        feedback: { warning: 'warn', suggestions: [] },
      });
      fireEvent.change(input, { target: { value: `pass-${score}` } });

      // Update value prop to trigger meter render
      rerender(
        <PasswordInput showStrengthMeter onScoreChange={onScoreChange} value={`pass-${score}`} />,
      );
    });

    expect(onScoreChange).toHaveBeenCalledWith(5);
  });

  it('should cover fallback feedback paths', () => {
    const { container } = render(<PasswordInput showStrengthMeter onChange={vi.fn()} />);
    const input = container.querySelector('input') as HTMLInputElement;

    // Test suggestion fallback (warning empty, suggestion present)
    mockZxcvbn.mockReturnValueOnce({
      score: 1,
      feedback: { warning: '', suggestions: ['Use a longer password'] },
    });
    fireEvent.change(input, { target: { value: 'short' } });

    // Test empty fallback (both empty)
    mockZxcvbn.mockReturnValueOnce({
      score: 4,
      feedback: { warning: '', suggestions: [] },
    });
    fireEvent.change(input, { target: { value: 'verylongpassword123!' } });
  });
});
