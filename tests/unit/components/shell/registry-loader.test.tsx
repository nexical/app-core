/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegistryLoader } from '@/components/shell/registry-loader';
import * as LibRegistryLoader from '@/lib/ui/registry-loader';

// Mock dependencies
vi.mock('@/lib/ui/registry-loader', () => ({
  getZoneComponents: vi.fn(),
}));

const MockComponent = ({ name }: { name: string }) => (
  <div data-testid={`comp-${name}`}>{name}</div>
);

describe('RegistryLoader Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render components for a specific zone', async () => {
    vi.mocked(LibRegistryLoader.getZoneComponents).mockResolvedValue([
      { name: 'item1', order: 1, component: () => <MockComponent name="item1" /> },
      { name: 'item2', order: 2, component: () => <MockComponent name="item2" /> },
    ]);

    await act(async () => {
      render(<RegistryLoader zone="test-zone" />);
    });

    expect(await screen.findByTestId('comp-item1')).toBeDefined();
    expect(await screen.findByTestId('comp-item2')).toBeDefined();
  });

  it('should handle empty zones gracefully', async () => {
    vi.mocked(LibRegistryLoader.getZoneComponents).mockResolvedValue([]);

    await act(async () => {
      const { container } = render(<RegistryLoader zone="empty-zone" />);
      expect(container.firstChild).toBeNull();
    });
  });
});
