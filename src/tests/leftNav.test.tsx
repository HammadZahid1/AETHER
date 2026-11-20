import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LeftNav } from '@/components/layout/LeftNav';
import { useAetherStore } from '@/state/store';

describe('LeftNav module search', () => {
  beforeEach(() => useAetherStore.setState({
    activeModule: 'wind',
    settings: { ...useAetherStore.getState().settings, sidebarCollapsed: false },
  }));

  it('filters navigation modules by label', () => {
    render(<LeftNav mobileOpen onMobileClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Search modules'), { target: { value: 'storm' } });
    expect(screen.getByText('Storm Lab')).toBeTruthy();
    expect(screen.queryByText('Wind Lab')).toBeNull();
  });
});
