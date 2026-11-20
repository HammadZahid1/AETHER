import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SceneErrorBoundary } from '@/renderer/SceneErrorBoundary';

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('renderer exploded');
  return <div data-testid="scene" />;
}

describe('SceneErrorBoundary', () => {
  it('shows a recoverable fallback when children throw', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const view = render(<SceneErrorBoundary><Bomb shouldThrow /></SceneErrorBoundary>);
    expect(screen.getByText('Viewport stopped unexpectedly')).toBeTruthy();

    view.rerender(<SceneErrorBoundary><Bomb shouldThrow={false} /></SceneErrorBoundary>);
    fireEvent.click(screen.getByRole('button', { name: 'Retry viewport' }));
    expect(screen.getByTestId('scene')).toBeTruthy();
    consoleError.mockRestore();
  });
});
