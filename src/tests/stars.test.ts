import { describe, expect, it } from 'vitest';
import { generateStarPositions } from '@/renderer/stars';

describe('starfield generation', () => {
  it('is deterministic for a given seed', () => {
    expect(Array.from(generateStarPositions(12, 3))).toEqual(Array.from(generateStarPositions(12, 3)));
  });

  it('places stars inside the requested distance shell', () => {
    const positions = generateStarPositions(64, 9, 30, 40);
    expect(positions).toHaveLength(192);
    for (let index = 0; index < positions.length; index += 3) {
      const radius = Math.hypot(positions[index], positions[index + 1], positions[index + 2]);
      expect(radius).toBeGreaterThanOrEqual(30);
      expect(radius).toBeLessThanOrEqual(40);
    }
  });
});
