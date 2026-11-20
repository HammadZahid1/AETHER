import { getSimulationModules } from '@/engine/simulationModules';
import { ParticleCloud } from '@/renderer/ParticleCloud';
import { useAetherStore } from '@/state/store';

/** Falling rain and snow particles over the selected region. */
export function PrecipitationLayer() {
  useAetherStore((state) => state.frame);
  const layer = useAetherStore((state) => state.layers.precipitation);
  const config = useAetherStore((state) => state.configurations.precipitation);
  const precipitation = getSimulationModules()?.precipitation;

  if (!precipitation || !layer.visible || !config.enabled) return null;

  return (
    <ParticleCloud
      system={precipitation.particleSystem}
      opacity={layer.opacity}
      sizeScale={6 * layer.intensity}
      additive={false}
      fadeWithAge={false}
    />
  );
}
