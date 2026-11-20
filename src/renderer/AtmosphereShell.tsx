import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { atmosphereLayerColor, atmosphereLayerRadius } from '@/renderer/atmosphere';
import { useAetherStore } from '@/state/store';

const vertexShader = `
  varying vec3 vNormalWorld;
  varying vec3 vWorldPosition;
  void main() {
    vNormalWorld = normalize(mat3(modelMatrix) * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPosition = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uGlow;
  varying vec3 vNormalWorld;
  varying vec3 vWorldPosition;
  void main() {
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float rim = pow(1.0 - abs(dot(normalize(vNormalWorld), viewDirection)), 2.25);
    float alpha = clamp(rim * uOpacity * (0.4 + uGlow), 0.0, 1.0);
    gl_FragColor = vec4(uColor, alpha);
  }
`;

/** Translucent selected atmospheric layer with an additive fresnel glow. */
export function AtmosphereShell() {
  const atmosphere = useAetherStore((state) => state.configurations.atmosphere);
  const color = atmosphereLayerColor(atmosphere.layerId);
  const radius = Math.min(1.6, atmosphereLayerRadius(atmosphere.layerId, atmosphere.height));

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: atmosphere.opacity },
      uGlow: { value: atmosphere.glow },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
  }), [color, atmosphere.opacity, atmosphere.glow]);

  useEffect(() => () => material.dispose(), [material]);

  if (!atmosphere.visible) return null;

  return (
    <group>
      <mesh renderOrder={3}>
        <sphereGeometry args={[radius, 64, 40]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh renderOrder={2}>
        <sphereGeometry args={[Math.min(radius + 0.12, 1.62), 48, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={Math.min(0.2, atmosphere.opacity * atmosphere.glow * 0.18)}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
