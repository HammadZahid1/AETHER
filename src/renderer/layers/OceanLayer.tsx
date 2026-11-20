import { useEffect, useMemo } from 'react';
import {
  OCEAN_TEXTURE_HEIGHT,
  OCEAN_TEXTURE_WIDTH,
} from '@/simulations/ocean/OceanSimulation';
import { getSimulationModules } from '@/engine/simulationModules';
import { ParticleCloud } from '@/renderer/ParticleCloud';
import { createDataTexture, updateDataTexture } from '@/renderer/textures';
import { useAetherStore } from '@/state/store';

/** Ocean current particles with an optional sea-surface temperature overlay. */
export function OceanLayer() {
  useAetherStore((state) => state.frame);
  const layer = useAetherStore((state) => state.layers.ocean);
  const config = useAetherStore((state) => state.configurations.ocean);
  const ocean = getSimulationModules()?.ocean;
  const texture = useMemo(() => ocean
    ? createDataTexture(OCEAN_TEXTURE_WIDTH, OCEAN_TEXTURE_HEIGHT, ocean.textureData)
    : null, [ocean]);

  useEffect(() => {
    if (!ocean || !texture) return;
    updateDataTexture(texture, ocean.rasterize());
  }, [ocean, texture, config]);

  useEffect(() => () => texture?.dispose(), [texture]);

  if (!ocean || !texture || !layer.visible || !config.enabled) return null;

  return (
    <group>
      <ParticleCloud
        system={ocean.particleSystem}
        opacity={layer.opacity}
        sizeScale={7 * layer.intensity}
        additive
      />
      {config.temperatureOverlay ? (
        <mesh rotation={[0, Math.PI, 0]} renderOrder={1}>
          <sphereGeometry args={[1.011, 72, 48]} />
          <meshBasicMaterial map={texture} transparent opacity={layer.opacity * 0.55} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
}
