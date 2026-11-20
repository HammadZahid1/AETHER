import { getSimulationModules } from '@/engine/simulationModules';
import { ParticleCloud } from '@/renderer/ParticleCloud';
import { useAetherStore } from '@/state/store';

/** Wind particle shell. Other wind display modes are layered separately. */
export function WindLayer() {
  useAetherStore((state) => state.frame);
  const layer = useAetherStore((state) => state.layers.wind);
  const config = useAetherStore((state) => state.configurations.wind);
  const wind = getSimulationModules()?.wind;

  if (!wind || !layer.visible || !config.enabled || !config.flowVisible) return null;

  return (
    <ParticleCloud
      system={wind.particleSystem.particles}
      opacity={layer.opacity}
      sizeScale={5 * layer.intensity}
      additive
    />
  );
}
