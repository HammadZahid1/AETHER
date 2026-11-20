import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useTheme } from '@/hooks/useTheme';
import { useAetherStore } from '@/state/store';

describe('useTheme', () => {
  it('reflects stored theme settings on the document root', () => {
    renderHook(() => useTheme());
    act(() => useAetherStore.getState().updateSettings({ theme: 'slate', reducedMotion: true }));
    expect(document.documentElement.dataset.theme).toBe('slate');
    expect(document.documentElement.dataset.reducedMotion).toBe('true');
  });
});
