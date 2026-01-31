import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { NavProvider } from '@/lib/ui/nav-context';

// Mock auth-astro/client
vi.mock('auth-astro/client', () => ({
  signOut: vi.fn(),
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({
    children,
    ...props
  }: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
}));

import UserProfile from '../../../src/registry/header-end/20-user-menu';

const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  image: null,
};

test('renders user menu with initials', () => {
  render(
    <NavProvider value={{ context: { user: mockUser }, workspaces: [] }}>
      <UserProfile />
    </NavProvider>,
  );

  expect(screen.getByLabelText('Toggle user menu')).toBeDefined();
  expect(screen.getByText('Test User')).toBeDefined();
  expect(screen.queryByTestId('user-menu-admin-users')).toBeNull();
});

test('renders admin link for admin users', async () => {
  const adminUser = { ...mockUser, role: 'ADMIN' };
  render(
    <NavProvider value={{ context: { user: adminUser }, workspaces: [] }}>
      <UserProfile />
    </NavProvider>,
  );

  // Open the menu using fireEvent
  const trigger = screen.getByTestId('user-menu-trigger');
  fireEvent.click(trigger);

  expect(await screen.findByTestId('user-menu-admin-users')).toBeDefined();
});
