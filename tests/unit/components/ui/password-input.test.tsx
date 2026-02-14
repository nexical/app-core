/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, type Mock } from 'vitest';
import { PasswordInput } from '@/components/ui/password-input';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('zxcvbn', () => ({
  default: vi.fn(() => ({
    score: 2,
    feedback: {
      warning: 'Some warning',
      suggestions: ['Suggestion 1'],
    },
  })),
}));

describe('PasswordInput', () => {
  it('should toggle password visibility', () => {
    const { container } = render(<PasswordInput />);
    const passwordInput = container.querySelector('input') as HTMLInputElement;

    expect(passwordInput.type).toBe('password');

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    expect(passwordInput.type).toBe('text');

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('should show strength meter when enabled', async () => {
    const { container } = render(
      <PasswordInput showStrengthMeter value="password123" onChange={() => {}} />,
    );

    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'newpassword' } });

    expect(await screen.findByText('user.components.password_input.strength.fair')).toBeDefined();
    expect(screen.getByText('Some warning')).toBeDefined();

    // Test other scores
    const scores = [
      { score: 0, label: 'too_weak' },
      { score: 1, label: 'weak' },
      { score: 3, label: 'good' },
      { score: 4, label: 'strong' },
    ];

    const zxcvbnMock = (await import('zxcvbn')).default as Mock;

    for (const { score, label } of scores) {
      zxcvbnMock.mockReturnValueOnce({
        score,
        feedback: { warning: '', suggestions: [] },
      });
      fireEvent.change(input, { target: { value: `password-${score}` } });
      expect(
        await screen.findByText(`user.components.password_input.strength.${label}`),
      ).toBeDefined();
    }

    // Test invalid score to hit default branches in getStrengthColor and getStrengthLabel
    zxcvbnMock.mockReturnValueOnce({
      score: 5,
      feedback: { warning: '', suggestions: [] },
    });
    fireEvent.change(input, { target: { value: 'invalid-score' } });

    // Label should be empty for score 5 in getStrengthLabel
    await waitFor(() => {
      const labelSpan = container.querySelector('.password-strength-label');
      expect(labelSpan?.textContent).toBe('');
    });
  });

  it('should call onScoreChange when provided', () => {
    const onScoreChange = vi.fn();
    const { container } = render(<PasswordInput onScoreChange={onScoreChange} />);
    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test' } });
    expect(onScoreChange).toHaveBeenCalled();
  });
});
