import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ParticleSystem } from '@/engine/particles';
import { createParticleGeometryBuffers, writeParticleBuffers } from '@/renderer/particles';

const vertexShader = `
  attribute vec3 color;
  attribute float aSize;
  attribute float aOpacity;
  uniform float uSizeScale;
  varying vec3 vColor;
  varying float vOpacity;
  void main() {
    vColor = color;
    vOpacity = aOpacity;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = clamp(aSize * uSizeScale * (240.0 / -viewPosition.z), 1.0, 28.0);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const fragmentShader = `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vOpacity;
  void main() {
    float distanceFromCenter = length(gl_PointCoord - vec2(0.5));
    if (distanceFromCenter > 0.5) discard;
    float softness = smoothstep(0.5, 0.12, distanceFromCenter);
    gl_FragColor = vec4(vColor, softness * vOpacity * uOpacity);
  }
`;

interface ParticleCloudProps {
  system: ParticleSystem;
  opacity?: number;
  sizeScale?: number;
  visible?: boolean;
  additive?: boolean;
  fadeWithAge?: boolean;
}

/** Generic point-sprite renderer for any deterministic particle system. */
export function ParticleCloud({
  system,
  opacity = 1,
  sizeScale = 1,
  visible = true,
  additive = true,
  fadeWithAge = true,
}: ParticleCloudProps) {
  const buffers = useMemo(() => createParticleGeometryBuffers(system.capacity), [system]);
  const geometry = useMemo(() => {
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute('position', new THREE.BufferAttribute(buffers.positions, 3));
    buffer.setAttribute('color', new THREE.BufferAttribute(buffers.colors, 3));
    buffer.setAttribute('aSize', new THREE.BufferAttribute(buffers.sizes, 1));
    buffer.setAttribute('aOpacity', new THREE.BufferAttribute(buffers.opacities, 1));
    buffer.setDrawRange(0, 0);
    return buffer;
  }, [buffers]);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uOpacity: { value: opacity },
      uSizeScale: { value: sizeScale },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  }), [additive, opacity, sizeScale]);

  useEffect(() => {
    material.uniforms.uOpacity.value = opacity;
    material.uniforms.uSizeScale.value = sizeScale;
  }, [material, opacity, sizeScale]);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  useFrame(() => {
    if (!visible) return;
    const count = writeParticleBuffers(system, buffers, fadeWithAge);
    geometry.setDrawRange(0, count);
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    geometry.attributes.aSize.needsUpdate = true;
    geometry.attributes.aOpacity.needsUpdate = true;
  });

  if (!visible) return null;

  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={5} />;
}
