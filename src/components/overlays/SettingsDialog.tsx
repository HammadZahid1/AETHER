import { Dialog } from '@/components/ui/Dialog';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { Switch } from '@/components/ui/Switch';
import { useAetherStore, resetPersistedSettings } from '@/state/store';
import { createDefaultSettings } from '@/data/defaults';
import type { RenderingConfig } from '@/types/config';
import type { QualityMode } from '@/types/simulation';

/** Application preferences and rendering quality controls. */
export function SettingsDialog() {
  const open = useAetherStore((state) => state.settingsOpen);
  const setOpen = useAetherStore((state) => state.setSettingsOpen);
  const settings = useAetherStore((state) => state.settings);
  const updateSettings = useAetherStore((state) => state.updateSettings);
  const notify = useAetherStore((state) => state.notify);

  const updateRendering = (patch: Partial<RenderingConfig>) => {
    updateSettings({ rendering: { ...settings.rendering, ...patch } });
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      title="Settings"
      subtitle="Preferences are stored locally in this browser."
      width="max-w-xl"
    >
      <div className="space-y-5">
        <section className="space-y-3">
          <div className="aether-label">Appearance</div>
          <Select
            label="Theme"
            value={settings.theme}
            options={[
              { value: 'dark', label: 'Dark' },
              { value: 'midnight', label: 'Midnight' },
              { value: 'slate', label: 'Slate' },
            ]}
            onChange={(theme) => updateSettings({ theme })}
          />
          <Switch
            label="Reduced motion"
            description="Disable camera easing and continuous rotation."
            checked={settings.reducedMotion}
            onChange={(reducedMotion) => updateSettings({ reducedMotion })}
          />
          <Switch
            label="Show tooltips"
            checked={settings.showTooltips}
            onChange={(showTooltips) => updateSettings({ showTooltips })}
          />
          <Switch
            label="Show geographic grid"
            checked={settings.showGrid}
            onChange={(showGrid) => updateSettings({ showGrid })}
          />
        </section>

        <section className="space-y-3 border-t border-[var(--aether-border)] pt-4">
          <div className="aether-label">Rendering</div>
          <Select<QualityMode>
            label="Quality mode"
            value={settings.rendering.quality}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'balanced', label: 'Balanced' },
              { value: 'high', label: 'High' },
            ]}
            onChange={(quality) => updateRendering({ quality })}
          />
          <Slider
            label="Pixel ratio cap"
            value={settings.rendering.pixelRatioCap}
            min={1}
            max={2}
            step={0.25}
            precision={2}
            onChange={(pixelRatioCap) => updateRendering({ pixelRatioCap })}
          />
          <Slider
            label="Particle scale"
            value={settings.rendering.particleScale}
            min={0.25}
            max={2}
            step={0.05}
            precision={2}
            onChange={(particleScale) => updateRendering({ particleScale })}
          />
          <Switch label="Antialiasing" checked={settings.rendering.antialias} onChange={(antialias) => updateRendering({ antialias })} />
          <Switch label="Shadows" checked={settings.rendering.shadows} onChange={(shadows) => updateRendering({ shadows })} />
        </section>

        <section className="border-t border-[var(--aether-border)] pt-4">
          <button
            type="button"
            onClick={() => {
              resetPersistedSettings();
              updateSettings(createDefaultSettings());
              notify('Settings restored to defaults', 'success');
            }}
            className="aether-panel px-3 py-2 text-[11px] text-[var(--aether-text-muted)] hover:text-[var(--aether-text)]"
          >
            Restore default settings
          </button>
          <p className="mt-2 text-[10px] leading-snug text-[var(--aether-text-dim)]">
            AETHER data is procedurally simulated for exploration and teaching. It is not a weather forecast or observational dataset.
          </p>
        </section>
      </div>
    </Dialog>
  );
}
