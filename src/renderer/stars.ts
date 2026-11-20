import { createRandom } from '@/engine/noise';
import { DEG_TO_RAD } from '@/engine/coordinates';

/** Generate deterministic background star positions on a distant shell. */
export function generateStarPositions(count: number, seed = 7, minRadius = 30, maxRadius = 60): Float32Array {
  const random = createRandom(seed);
  const positions = new Float32Array(Math.max(0, count) * 3);
  for (let index = 0; index < count; index += 1) {
    const latitude = Math.asin(random() * 2 - 1) / DEG_TO_RAD;
    const longitude = random() * 360 - 180;
    const phi = latitude * DEG_TO_RAD;
    const lambda = longitude * DEG_TO_RAD;
    const radius = minRadius + random() * Math.max(0, maxRadius - minRadius);
    const cosPhi = Math.cos(phi);
    const offset = index * 3;
    positions[offset] = radius * cosPhi * Math.cos(lambda);
    positions[offset + 1] = radius * Math.sin(phi);
    positions[offset + 2] = -radius * cosPhi * Math.sin(lambda);
  }
  return positions;
}
