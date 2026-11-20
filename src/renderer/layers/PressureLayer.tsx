import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import {
  PRESSURE_TEXTURE_HEIGHT,
  PRESSURE_TEXTURE_WIDTH,
} from '@/simulations/pressure/PressureSimulation';
import { getSimulationModules } from '@/engine/simulationModules';
import { contourSegmentsToPositions } from '@/renderer/geometry';
import { createDataTexture, updateDataTexture } from '@/renderer/textures';
import { useAetherStore } from '@/state/store';

/** Pressure field raster plus isobar contour lines. */
export function PressureLayer() {
  const time = useAetherStore((state) => state.elapsed);
  const layer = useAetherStore((state) => state.layers.pressure);
  const config = useAetherStore((state) => state.configurations.pressure);
  const pressure = getSimulationModules()?.pressure;
  const quantizedTime = Math.round(time * 2) / 2;

  const texture = useMemo(() => pressure
    ? createDataTexture(PRESSURE_TEXTURE_WIDTH, PRESSURE_TEXTURE_HEIGHT, pressure.texture)
    : null, [pressure]);

  const contours = useMemo(() => {
    if (!pressure) return new Float32Array(0);
    const segments = pressure.contourLines.flatMap((line) => line.segments);
    return contourSegmentsToPositions(segments, 1.012);
  }, [pressure, quantizedTime]);

  const geometry = useMemo(() => {
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute('position', new THREE.BufferAttribute(contours, 3));
    return buffer;
  }, [contours]);

  useEffect(() => {
    if (!pressure || !texture) return;
    updateDataTexture(texture, pressure.rasterize(quantizedTime));
  }, [pressure, texture, quantizedTime, config]);

  useEffect(() => () => {
    texture?.dispose();
    geometry.dispose();
  }, [texture, geometry]);

  if (!pressure || !texture || !layer.visible || !config.enabled) return null;

  return (
    <group>
      {config.fieldVisible ? (
        <mesh rotation={[0, Math.PI, 0]} renderOrder={1}>
          <sphereGeometry args={[1.009, 72, 48]} />
          <meshBasicMaterial map={texture} transparent opacity={layer.opacity * 0.75} depthWrite={false} />
        </mesh>
      ) : null}
      {config.contoursVisible && contours.length ? (
        <lineSegments geometry={geometry} renderOrder={7}>
          <lineBasicMaterial color="#ffd98a" transparent opacity={layer.opacity} depthWrite={false} />
        </lineSegments>
      ) : null}
    </group>
  );
}
