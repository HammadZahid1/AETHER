import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { AtmosphereShell } from '@/renderer/AtmosphereShell';
import { CameraRig } from '@/renderer/CameraRig';
import { Earth } from '@/renderer/Earth';
import { GridOverlay } from '@/renderer/GridOverlay';
import { SelectionMarker } from '@/renderer/SelectionMarker';
import { SpaceEnvironment } from '@/renderer/SpaceEnvironment';
import { ClimateLayer } from '@/renderer/layers/ClimateLayer';
import { CloudLayer } from '@/renderer/layers/CloudLayer';
import { OceanLayer } from '@/renderer/layers/OceanLayer';
import { OceanStreamlines } from '@/renderer/layers/OceanStreamlines';
import { PressureLayer } from '@/renderer/layers/PressureLayer';
import { PrecipitationLayer } from '@/renderer/layers/PrecipitationLayer';
import { StormLayer } from '@/renderer/layers/StormLayer';
import { TemperatureLayer } from '@/renderer/layers/TemperatureLayer';
import { WindLayer } from '@/renderer/layers/WindLayer';
import { WindVectorLayer } from '@/renderer/layers/WindVectorLayer';
import { isWebGLAvailable } from '@/renderer/webgl';
import { WebGLFallback } from '@/renderer/WebGLFallback';
import { useAetherStore } from '@/state/store';

/** Root WebGL scene composing the globe and every optional visualization layer. */
export function SceneCanvas() {
  const rendering = useAetherStore((state) => state.settings.rendering);
  const webglAvailable = useMemo(isWebGLAvailable, []);
  if (!webglAvailable) return <WebGLFallback />;

  return (
    <Canvas
      dpr={[1, rendering.pixelRatioCap]}
      gl={{ antialias: rendering.antialias, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 2.8], fov: 42, near: 0.01, far: 200 }}
    >
      <color attach="background" args={['#03060c']} />
      <SpaceEnvironment />
      <CameraRig />
      <Earth />
      <TemperatureLayer />
      <PressureLayer />
      <OceanLayer />
      <OceanStreamlines />
      <ClimateLayer />
      <GridOverlay />
      <AtmosphereShell />
      <WindLayer />
      <WindVectorLayer />
      <CloudLayer />
      <PrecipitationLayer />
      <StormLayer />
      <SelectionMarker />
    </Canvas>
  );
}
