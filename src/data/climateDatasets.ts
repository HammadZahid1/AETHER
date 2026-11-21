import type { ClimateDatasetId } from '@/types/config';
import { clamp } from '@/engine/coordinates';
import { fbm3D } from '@/engine/noise';
import { geoToCartesian } from '@/engine/coordinates';

/**
 * Illustrative climate datasets generated deterministically in the browser.
 * These are teaching values, not observations or reanalysis products.
 */
export interface ClimateDataset {
  id: ClimateDatasetId;
  name: string;
  unit: string;
  description: string;
  min: number;
  max: number;
  sample: (latitude: number, longitude: number, season: number) => number;
}

/** Season index 0..3 mapped to a solar declination-like phase. */
export function seasonPhase(season: number): number {
  return (clamp(season, 0, 4) / 4) * Math.PI * 2;
}

function spatialNoise(latitude: number, longitude: number, seed: number, scale = 2.2): number {
  const point = geoToCartesian(latitude, longitude);
  return fbm3D(point.x * scale, point.y * scale, point.z * scale, 4, seed);
}

export const CLIMATE_DATASETS: Record<ClimateDatasetId, ClimateDataset> = {
  temperature: {
    id: 'temperature',
    name: 'Illustrative Surface Temperature',
    unit: '°C',
    description: 'Latitude-driven seasonal temperature pattern with deterministic regional variation.',
    min: -45,
    max: 40,
    sample: (latitude, longitude, season) => {
      const lat = Math.abs(latitude) / 90;
      const seasonal = -Math.cos(seasonPhase(season)) * (latitude >= 0 ? 1 : -1) * 12 * lat;
      const base = 30 - lat * 70 + seasonal;
      return clamp(base + spatialNoise(latitude, longitude, 41) * 7, -45, 40);
    },
  },
  rainfall: {
    id: 'rainfall',
    name: 'Illustrative Rainfall Distribution',
    unit: 'mm/month',
    description: 'Simplified tropical and mid-latitude precipitation maxima with dry subtropical belts.',
    min: 0,
    max: 320,
    sample: (latitude, longitude, season) => {
      const absLat = Math.abs(latitude);
      const tropical = Math.exp(-((absLat / 12) ** 2)) * 220;
      const midLatitude = Math.exp(-((((absLat - 48) / 18) ** 2))) * 110;
      const subtropicalDry = Math.exp(-((((absLat - 27) / 9) ** 2))) * 70;
      const monsoon = -Math.cos(seasonPhase(season) + longitude * 0.01) * 35;
      return clamp(tropical + midLatitude - subtropicalDry + monsoon + spatialNoise(latitude, longitude, 73) * 30, 0, 320);
    },
  },
  zones: {
    id: 'zones',
    name: 'Illustrative Climate Zones',
    unit: 'index',
    description: 'Broad Köppen-inspired climate zone index ordered from polar to tropical.',
    min: 0,
    max: 5,
    sample: (latitude, longitude, season) => {
      const absLat = Math.abs(latitude);
      const index = 5 - (absLat / 90) * 5;
      return clamp(index + spatialNoise(latitude, longitude, 19) * 0.55 - Math.cos(seasonPhase(season)) * 0.15, 0, 5);
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Illustrative Ocean Temperature',
    unit: '°C',
    description: 'Simplified sea-surface temperature gradient with local variability.',
    min: -2,
    max: 32,
    sample: (latitude, longitude, season) => {
      const seasonal = -Math.cos(seasonPhase(season)) * (latitude >= 0 ? 1 : -1) * 3;
      return clamp(29 - Math.abs(latitude) * 0.38 + seasonal + spatialNoise(latitude, longitude, 101) * 2.5, -2, 32);
    },
  },
};

export const CLIMATE_DATASET_LIST = Object.values(CLIMATE_DATASETS);

/** Human-readable label for a climate zone index. */
export function climateZoneLabel(index: number): string {
  if (index >= 4.2) return 'Tropical';
  if (index >= 3.2) return 'Subtropical';
  if (index >= 2.2) return 'Temperate';
  if (index >= 1.2) return 'Boreal';
  return 'Polar';
}

/** Continuous seasonal label for a 0..4 season value. */
export function seasonLabel(season: number): string {
  const names = ['Northern winter', 'Northern spring', 'Northern summer', 'Northern autumn'];
  return names[Math.floor(((season % 4) + 4) % 4)];
}