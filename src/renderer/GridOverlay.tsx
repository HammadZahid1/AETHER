import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { geographicGridSegments } from '@/renderer/geometry';
import { useAetherStore } from '@/state/store';

/** Latitude/longitude reference grid drawn just above the globe surface. */
export function GridOverlay() {
  const layer = useAetherStore((state) => state.layers.grid);
  const showGrid = useAetherStore((state) => state.settings.showGrid);
  const geometry = useMemo(() => {
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute('position', new THREE.BufferAttribute(geographicGridSegments(15, 15), 3));
    return buffer;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  if (!layer.visible || !showGrid) return null;

  return (
    <lineSegments geometry={geometry} renderOrder={4}>
      <lineBasicMaterial
        color="#7fb3cc"
        transparent
        opacity={Math.min(0.5, layer.opacity * 0.34)}
        depthWrite={false}
      />
    </lineSegments>
  );
}
