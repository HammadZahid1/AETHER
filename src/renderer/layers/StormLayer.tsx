import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { getSimulationModules } from '@/engine/simulationModules';
import { geoPathsToSegments } from '@/renderer/geometry';
import { ParticleCloud } from '@/renderer/ParticleCloud';
import { useAetherStore } from '@/state/store';

/** Spiral storm particles and optional projected trajectory. */
export function StormLayer() {
  const time = useAetherStore((state) => state.elapsed);
  const layer = useAetherStore((state) => state.layers.storm);
  const config = useAetherStore((state) => state.configurations.storm);
  const storm = getSimulationModules()?.storm;
  useAetherStore((state) => state.frame);
  const quantizedTime = Math.round(time);

  const trajectory = useMemo(() => storm
    ? geoPathsToSegments([storm.trajectory], 1.055)
    : new Float32Array(0), [storm, quantizedTime, config.trajectoryVisible]);

  const geometry = useMemo(() => {
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute('position', new THREE.BufferAttribute(trajectory, 3));
    return buffer;
  }, [trajectory]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  if (!storm || !layer.visible || !config.enabled) return null;

  return (
    <group>
      <ParticleCloud
        system={storm.particleSystem}
        opacity={layer.opacity}
        sizeScale={8 * layer.intensity}
        additive
      />
      {config.trajectoryVisible && trajectory.length ? (
        <lineSegments geometry={geometry} renderOrder={8}>
          <lineBasicMaterial color="#f3a8ff" transparent opacity={layer.opacity} depthWrite={false} />
        </lineSegments>
      ) : null}
    </group>
  );
}
