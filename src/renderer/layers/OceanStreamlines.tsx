import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { getSimulationModules } from '@/engine/simulationModules';
import { geoPathsToSegments } from '@/renderer/geometry';
import { useAetherStore } from '@/state/store';

/** Traced ocean gyre streamlines when enabled in the ocean lab. */
export function OceanStreamlines() {
  const layer = useAetherStore((state) => state.layers.ocean);
  const config = useAetherStore((state) => state.configurations.ocean);
  const ocean = getSimulationModules()?.ocean;

  const geometry = useMemo(() => {
    const buffer = new THREE.BufferGeometry();
    if (!ocean) return buffer;
    const paths = ocean.streamlines();
    buffer.setAttribute('position', new THREE.BufferAttribute(geoPathsToSegments(paths, 1.014), 3));
    return buffer;
  }, [ocean, config.currentSpeed]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  if (!ocean || !layer.visible || !config.enabled || !config.streamlinesVisible) return null;

  return (
    <lineSegments geometry={geometry} renderOrder={7}>
      <lineBasicMaterial color="#5ce0d8" transparent opacity={layer.opacity * 0.8} depthWrite={false} />
    </lineSegments>
  );
}
