import { getSimulationModules } from '@/engine/simulationModules';
import { ParticleCloud } from '@/renderer/ParticleCloud';
import { useAetherStore } from '@/state/store';

/** Layered procedural cloud puffs. */
export function CloudLayer() {
  useAetherStore((state) => state.frame);
  const layer = useAetherStore((state) => state.layers.clouds);
  const config = useAetherStore((state) => state.configurations.clouds);
  const clouds = getSimulationModules()?.clouds;

  if (!clouds || !layer.visible || !config.enabled) return null;

  return (
    <ParticleCloud
      system={clouds.particleSystem}
      opacity={layer.opacity * config.opacity}
      sizeScale={9 * layer.intensity}
      additive={false}
      fadeWithAge={false}
    />
  );
}
