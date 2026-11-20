import { useCallback, useEffect, useState } from 'react';
import { CommandPalette } from '@/components/overlays/CommandPalette';
import { DataProvenanceDialog } from '@/components/overlays/DataProvenanceDialog';
import { DiagnosticsOverlay } from '@/components/overlays/DiagnosticsOverlay';
import { HelpDialog } from '@/components/overlays/HelpDialog';
import { InspectionHud } from '@/components/overlays/InspectionHud';
import { LayersPanel } from '@/components/overlays/LayersPanel';
import { LegendOverlay } from '@/components/overlays/LegendOverlay';
import { MobileControls } from '@/components/overlays/MobileControls';
import { Notifications } from '@/components/overlays/Notifications';
import { PerformanceHud } from '@/components/overlays/PerformanceHud';
import { ScenarioBrowser } from '@/components/overlays/ScenarioBrowser';
import { SettingsDialog } from '@/components/overlays/SettingsDialog';
import { ViewportControls } from '@/components/overlays/ViewportControls';
import { LeftNav } from '@/components/layout/LeftNav';
import { PanelRouter } from '@/components/panels/PanelRouter';
import { Timeline } from '@/components/layout/Timeline';
import { TopBar } from '@/components/layout/TopBar';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useSimulationEngine } from '@/hooks/useSimulationEngine';
import { useTheme } from '@/hooks/useTheme';
import { SceneCanvas } from '@/renderer/SceneCanvas';
import { SceneErrorBoundary } from '@/renderer/SceneErrorBoundary';
import { useAetherStore } from '@/state/store';

/** Application shell composing navigation, globe viewport, controls and overlays. */
export function App() {
  const controls = useSimulationEngine();
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const setCamera = useAetherStore((state) => state.setCamera);

  useTheme();
  useKeyboardShortcuts({
    controls,
    onResetCamera: () => setCamera({ target: { latitude: 12, longitude: -25 }, distance: 2.8, preset: 'Global View' }),
    onOpenScenarios: () => setScenarioOpen(true),
  });

  useEffect(() => {
    const update = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  }, []);

  const resetCamera = useCallback(() => {
    setCamera({ target: { latitude: 12, longitude: -25 }, distance: 2.8, preset: 'Global View' });
  }, [setCamera]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[var(--aether-bg)] text-[var(--aether-text)]">
      <TopBar onToggleFullscreen={toggleFullscreen} isFullscreen={isFullscreen} />
      <div className="flex min-h-0 flex-1">
        <LeftNav mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
        <main className="relative min-w-0 flex-1 overflow-hidden bg-[var(--aether-bg)]">
          <SceneErrorBoundary><SceneCanvas /></SceneErrorBoundary>
          <MobileControls onOpenNavigation={() => setMobileNavOpen(true)} />
          <ViewportControls onOpenScenarios={() => setScenarioOpen(true)} onResetCamera={resetCamera} />
          <LegendOverlay />
          <InspectionHud />
          <DiagnosticsOverlay />
          <PerformanceHud />
          <button
            type="button"
            onClick={() => setMobilePanelOpen(true)}
            className="aether-panel absolute right-3 top-1/2 z-20 -translate-y-1/2 px-2 py-2 text-[10px] lg:hidden"
          >
            Controls
          </button>
        </main>
        <PanelRouter mobileOpen={mobilePanelOpen} onMobileClose={() => setMobilePanelOpen(false)} onResetCamera={resetCamera} />
      </div>
      <Timeline
        onPlay={controls.play}
        onPause={controls.pause}
        onStop={controls.stop}
        onStep={controls.step}
      />
      <CommandPalette controls={controls} onResetCamera={resetCamera} />
      <SettingsDialog />
      <HelpDialog />
      <DataProvenanceDialog />
      <LayersPanel />
      <ScenarioBrowser open={scenarioOpen} onClose={() => setScenarioOpen(false)} />
      <Notifications />
    </div>
  );
}
