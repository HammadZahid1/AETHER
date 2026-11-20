import { useEffect, useMemo, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { geoToCartesian } from '@/engine/coordinates';
import { useAetherStore } from '@/state/store';

/** Smoothly moves the camera to store-driven geographic viewpoints. */
export function CameraRig() {
  const camera = useAetherStore((state) => state.camera);
  const reducedMotion = useAetherStore((state) => state.settings.reducedMotion);
  const threeCamera = useThree((state) => state.camera);
  const transitioning = useRef(false);
  const desired = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const direction = geoToCartesian(camera.target.latitude, camera.target.longitude, 1);
    desired.set(direction.x, direction.y, direction.z).multiplyScalar(camera.distance);
    transitioning.current = true;
    if (reducedMotion) {
      threeCamera.position.copy(desired);
      threeCamera.lookAt(0, 0, 0);
      transitioning.current = false;
    }
  }, [camera.target.latitude, camera.target.longitude, camera.distance, reducedMotion, desired, threeCamera]);

  useFrame((_, delta) => {
    if (!transitioning.current) return;
    const amount = Math.min(1, delta * 3.2);
    threeCamera.position.lerp(desired, amount);
    threeCamera.lookAt(0, 0, 0);
    if (threeCamera.position.distanceTo(desired) < 0.01) transitioning.current = false;
  });

  return (
    <OrbitControls
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={1.35}
      maxDistance={8}
      enablePan={false}
      autoRotate={camera.autoRotate && !reducedMotion}
      autoRotateSpeed={0.35}
      target={[0, 0, 0]}
    />
  );
}
