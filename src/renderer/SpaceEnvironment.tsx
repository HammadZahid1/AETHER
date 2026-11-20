import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { generateStarPositions } from '@/renderer/stars';

/** Scene lighting and a deterministic distant starfield. */
export function SpaceEnvironment() {
  const geometry = useMemo(() => {
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute('position', new THREE.BufferAttribute(generateStarPositions(900), 3));
    return buffer;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <>
      <ambientLight intensity={0.28} />
      <hemisphereLight args={['#9fc8ff', '#182332', 0.55]} />
      <directionalLight position={[4, 2.5, 5]} intensity={2.1} color="#fff4df" />
      <directionalLight position={[-4, -1, -3]} intensity={0.35} color="#4a83c8" />
      <points geometry={geometry}>
        <pointsMaterial color="#cddcf2" size={0.055} sizeAttenuation transparent opacity={0.7} depthWrite={false} />
      </points>
    </>
  );
}
