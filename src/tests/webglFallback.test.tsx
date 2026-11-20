import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WebGLFallback } from '@/renderer/WebGLFallback';

describe('WebGLFallback', () => {
  it('explains that rendering is unavailable but controls remain', () => {
    render(<WebGLFallback />);
    expect(screen.getByText('3D viewport unavailable')).toBeTruthy();
    expect(screen.getByText(/simulation controls and local data tools remain available/)).toBeTruthy();
  });
});
