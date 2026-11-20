import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-three/fiber', () => ({ Canvas: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
vi.mock('@/renderer/webgl', () => ({ isWebGLAvailable: () => false }));

import { SceneCanvas } from '@/renderer/SceneCanvas';

describe('SceneCanvas', () => {
  it('renders the fallback when WebGL is unavailable', () => {
    render(<SceneCanvas />);
    expect(screen.getByText('3D viewport unavailable')).toBeTruthy();
  });
});
