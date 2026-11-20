import { markerPosition } from '@/renderer/geometry';
import { useAetherStore } from '@/state/store';

/** Small glowing marker showing the coordinate used for local inspection. */
export function SelectionMarker() {
  const selected = useAetherStore((state) => state.selectedCoordinate);
  if (!selected) return null;
  const position = markerPosition(selected, 1.035);

  return (
    <group position={position} renderOrder={10}>
      <mesh>
        <sphereGeometry args={[0.018, 16, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.032, 16, 12]} />
        <meshBasicMaterial color="#48c9e8" transparent opacity={0.28} depthWrite={false} />
      </mesh>
    </group>
  );
}
