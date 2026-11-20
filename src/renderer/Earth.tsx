import { useEffect, useMemo } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { createDataTexture } from '@/renderer/textures';
import {
  EARTH_TEXTURE_HEIGHT,
  EARTH_TEXTURE_WIDTH,
  generateEarthTexture,
} from '@/renderer/earthTexture';
import { normalizeLongitude } from '@/engine/coordinates';
import { useAetherStore } from '@/state/store';

interface EarthProps {
  visible?: boolean;
}

/** Procedural globe surface with geographic click selection. */
export function Earth({ visible = true }: EarthProps) {
  const setSelectedCoordinate = useAetherStore((state) => state.setSelectedCoordinate);
  const texture = useMemo(
    () => createDataTexture(EARTH_TEXTURE_WIDTH, EARTH_TEXTURE_HEIGHT, generateEarthTexture()),
    [],
  );

  useEffect(() => () => texture.dispose(), [texture]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (!event.uv || !event.stopPropagation) return;
    event.stopPropagation();
    const latitude = 90 - event.uv.y * 180;
    const longitude = normalizeLongitude(event.uv.x * 360);
    setSelectedCoordinate({ latitude, longitude });
  };

  return (
    <mesh visible={visible} rotation={[0, Math.PI, 0]} onClick={handleClick}>
      <sphereGeometry args={[1, 72, 48]} />
      <meshStandardMaterial map={texture} roughness={0.94} metalness={0.02} />
    </mesh>
  );
}
