import { afterEach, describe, expect, it, vi } from 'vitest';
import { isWebGLAvailable } from '@/renderer/webgl';

describe('WebGL detection', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns false when no context can be created', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    expect(isWebGLAvailable()).toBe(false);
  });

  it('returns true when a context is available', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as never);
    expect(isWebGLAvailable()).toBe(true);
  });
});
