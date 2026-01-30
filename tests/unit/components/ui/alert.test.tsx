/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

describe('Alert', () => {
  it('should render correctly with default props', () => {
    render(
      <Alert>
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>This is an alert description.</AlertDescription>
      </Alert>,
    );

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('Heads up!')).toHaveClass('alert-title');
    expect(screen.getByText('This is an alert description.')).toHaveClass('alert-description');
  });

  it('should apply variant classes', () => {
    render(<Alert variant="destructive">Error</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('alert-destructive');
  });
});
