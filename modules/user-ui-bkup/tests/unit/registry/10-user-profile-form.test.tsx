import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import UserProfileForm from '@modules/user-ui/src/registry/details-panel/10-user-profile-form';
import { NavProvider } from '@/lib/ui/nav-context';

const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
};

test('renders user profile form with user data', () => {
  render(
    <NavProvider value={{ context: { user: mockUser }, workspaces: [] }}>
      <UserProfileForm props={{}} />
    </NavProvider>,
  );

  expect(screen.getByDisplayValue('Test User')).toBeDefined();
  expect(screen.getByDisplayValue('test@example.com')).toBeDefined();
});
