import { useEffect, useMemo } from 'react';
import {
  CLIMATE_TEXTURE_HEIGHT,
  CLIMATE_TEXTURE_WIDTH,
} from '@/simulations/climate/ClimateSimulation';
import { getSimulationModules } from '@/engine/simulationModules';
import { createDataTexture, updateDataTexture } from '@/renderer/textures';
import { useAetherStore } from '@/state/store';

/** Climate dataset overlay for temperature, rainfall, zones, or ocean. */
export function ClimateLayer() {
  const layer = useAetherStore((state) => state.layers.climate);
  const config = useAetherStore((state) => state.configurations.climate);
  const climate = getSimulationModules()?.climate;
  const texture = useMemo(() => climate
    ? createDataTexture(CLIMATE_TEXTURE_WIDTH, CLIMATE_TEXTURE_HEIGHT, climate.textureData)
    : null, [climate]);

  useEffect(() => {
    if (!climate || !texture) return;
    updateDataTexture(texture, climate.rasterize(config.season));
  }, [climate, texture, config]);

  useEffect(() => () => texture?.dispose(), [texture]);

  if (!climate || !texture || !layer.visible || !config.enabled) return null;

  return (
    <mesh rotation={[0, Math.PI, 0]} renderOrder={1}>
      <sphereGeometry args={[1.016, 72, 48]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={layer.opacity * (config.comparisonMode ? 0.7 : 0.85)}
        depthWrite={false}
      />
    </mesh>
  );
}
