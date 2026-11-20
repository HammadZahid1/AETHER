import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import {
  TEMPERATURE_TEXTURE_HEIGHT,
  TEMPERATURE_TEXTURE_WIDTH,
} from '@/simulations/temperature/TemperatureSimulation';
import { getSimulationModules } from '@/engine/simulationModules';
import { createDataTexture, updateDataTexture } from '@/renderer/textures';
import { useAetherStore } from '@/state/store';

/** Global temperature raster painted over the globe surface. */
export function TemperatureLayer() {
  const time = useAetherStore((state) => state.elapsed);
  const layer = useAetherStore((state) => state.layers.temperature);
  const config = useAetherStore((state) => state.configurations.temperature);
  const temperature = getSimulationModules()?.temperature;
  const quantizedTime = Math.round(time * 2) / 2;

  const texture = useMemo(() => temperature
    ? createDataTexture(TEMPERATURE_TEXTURE_WIDTH, TEMPERATURE_TEXTURE_HEIGHT, temperature.texture)
    : null, [temperature]);

  useEffect(() => {
    if (!temperature || !texture) return;
    updateDataTexture(texture, temperature.rasterize(quantizedTime));
  }, [temperature, texture, quantizedTime, config]);

  useEffect(() => () => texture?.dispose(), [texture]);

  if (!temperature || !texture || !layer.visible || !config.enabled) return null;

  return (
    <mesh rotation={[0, Math.PI, 0]} renderOrder={1}>
      <sphereGeometry args={[1.007, 72, 48]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={layer.opacity * config.opacity}
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </mesh>
  );
}
