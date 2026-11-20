import type { RenderingConfig } from '@/types/config';
import type { QualityMode } from '@/types/simulation';

/** Recommended rendering settings for each quality mode. */
export const QUALITY_PRESETS: Record<QualityMode, Partial<RenderingConfig>> = {
  low: { pixelRatioCap: 1, particleScale: 0.5, antialias: false, shadows: false, animationQuality: 0.5 },
  balanced: { pixelRatioCap: 1.25, particleScale: 1, antialias: true, shadows: false, animationQuality: 1 },
  high: { pixelRatioCap: 2, particleScale: 1.5, antialias: true, shadows: true, animationQuality: 1 },
};

/** Apply a quality preset while preserving unrelated rendering options. */
export function applyQualityPreset(config: RenderingConfig, mode: QualityMode): RenderingConfig {
  return { ...config, ...QUALITY_PRESETS[mode], quality: mode };
}
