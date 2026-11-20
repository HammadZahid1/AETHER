import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Dialog } from '@/components/ui/Dialog';

describe('Dialog focus management', () => {
  it('focuses the first control when opened', () => {
    render(<Dialog open onClose={vi.fn()} title="Test dialog"><button type="button">Child</button></Dialog>);
    expect(screen.getByLabelText('Close dialog')).toHaveFocus();
  });

  it('wraps tab navigation from the last control to the first', () => {
    render(<Dialog open onClose={vi.fn()} title="Test dialog"><button type="button">Child</button></Dialog>);
    const child = screen.getByRole('button', { name: 'Child' });
    child.focus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(screen.getByLabelText('Close dialog')).toHaveFocus();
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose} title="Test dialog"><span /></Dialog>);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
