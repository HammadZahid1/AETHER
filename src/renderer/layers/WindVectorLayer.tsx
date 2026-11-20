import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { getSimulationModules } from '@/engine/simulationModules';
import { buildWindStreamlineSegments, buildWindVectorSegments } from '@/renderer/windLines';
import { useAetherStore } from '@/state/store';

/** Streamline and vector modes for the wind laboratory. */
export function WindVectorLayer() {
  const time = useAetherStore((state) => state.elapsed);
  const layer = useAetherStore((state) => state.layers.wind);
  const config = useAetherStore((state) => state.configurations.wind);
  const wind = getSimulationModules()?.wind;
  const quantizedTime = Math.round(time);

  const geometry = useMemo(() => {
    const buffer = new THREE.BufferGeometry();
    if (!wind) return buffer;
    const sampler = (latitude: number, longitude: number, sampleTime?: number) => wind.sample(latitude, longitude, sampleTime);
    const data = config.mode === 'vectors'
      ? buildWindVectorSegments(sampler, quantizedTime)
      : buildWindStreamlineSegments(sampler, quantizedTime);
    buffer.setAttribute('position', new THREE.BufferAttribute(data, 3));
    return buffer;
  }, [wind, config.mode, quantizedTime]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  if (!wind || !layer.visible || !config.enabled) return null;
  if (!['vectors', 'streamlines', 'directional'].includes(config.mode)) return null;

  return (
    <lineSegments geometry={geometry} renderOrder={6}>
      <lineBasicMaterial color="#7ee4ff" transparent opacity={layer.opacity * 0.72} depthWrite={false} />
    </lineSegments>
  );
}
