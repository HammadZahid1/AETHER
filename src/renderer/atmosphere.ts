import { layerById } from '@/data/atmosphericLayers';
import { EARTH_RADIUS_KM } from '@/engine/coordinates';

/** Visual exaggeration factor that makes thin atmospheric layers readable. */
export const ATMOSPHERE_EXAGGERATION = 8;

/** Convert real altitude in kilometres into an exaggerated globe-shell radius. */
export function altitudeToRadius(kilometres: number, heightScale = 1): number {
  const altitude = Math.max(0, kilometres) / EARTH_RADIUS_KM;
  return 1 + altitude * ATMOSPHERE_EXAGGERATION * Math.max(0.05, heightScale);
}

/** Radius for the outer boundary of a named atmospheric layer. */
export function atmosphereLayerRadius(layerId: string, heightScale = 1): number {
  const layer = layerById(layerId);
  return altitudeToRadius(layer?.topKm ?? 50, heightScale);
}

/** Color associated with a named atmospheric layer. */
export function atmosphereLayerColor(layerId: string): string {
  return layerById(layerId)?.color ?? '#48c9e8';
}
