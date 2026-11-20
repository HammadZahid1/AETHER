import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';
import { MODULES } from '@/data/modules';
import { SCENARIOS } from '@/data/scenarios';
import type { SimulationControls } from '@/hooks/useSimulationEngine';
import { useAetherStore } from '@/state/store';
import { LAYER_IDS } from '@/types/simulation';

interface Command {
  id: string;
  label: string;
  group: string;
  icon: IconName;
  run: () => void;
}

interface CommandPaletteProps {
  controls: SimulationControls;
  onResetCamera: () => void;
}

/** Keyboard-driven command launcher for navigation, playback and layers. */
export function CommandPalette({ controls, onResetCamera }: CommandPaletteProps) {
  const open = useAetherStore((state) => state.commandPaletteOpen);
  const setOpen = useAetherStore((state) => state.setCommandPaletteOpen);
  const setModule = useAetherStore((state) => state.setModule);
  const toggleLayer = useAetherStore((state) => state.toggleLayer);
  const loadScenarioById = useAetherStore((state) => state.loadScenarioById);
  const setSettingsOpen = useAetherStore((state) => state.setSettingsOpen);
  const setHelpOpen = useAetherStore((state) => state.setHelpOpen);
  const setLayersPanelOpen = useAetherStore((state) => state.setLayersPanelOpen);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<Command[]>(() => [
    ...MODULES.map((module) => ({
      id: `module-${module.id}`,
      label: `Open ${module.label}`,
      group: 'Navigate',
      icon: module.icon,
      run: () => setModule(module.id),
    })),
    { id: 'play', label: 'Play simulation', group: 'Playback', icon: 'play', run: controls.play },
    { id: 'pause', label: 'Pause simulation', group: 'Playback', icon: 'pause', run: controls.pause },
    { id: 'stop', label: 'Stop simulation', group: 'Playback', icon: 'stop', run: controls.stop },
    { id: 'reset', label: 'Reset simulation', group: 'Playback', icon: 'reset', run: controls.reset },
    ...LAYER_IDS.map((layer) => ({
      id: `layer-${layer}`,
      label: `Toggle ${layer} layer`,
      group: 'Layers',
      icon: 'layers' as IconName,
      run: () => toggleLayer(layer),
    })),
    ...SCENARIOS.map((scenario) => ({
      id: `scenario-${scenario.id}`,
      label: `Load scenario: ${scenario.name}`,
      group: 'Scenarios',
      icon: 'sparkles' as IconName,
      run: () => loadScenarioById(scenario.id),
    })),
    { id: 'camera', label: 'Reset camera view', group: 'View', icon: 'camera', run: onResetCamera },
    { id: 'settings', label: 'Open settings', group: 'View', icon: 'settings', run: () => setSettingsOpen(true) },
    { id: 'help', label: 'Open help', group: 'View', icon: 'help', run: () => setHelpOpen(true) },
    { id: 'layers', label: 'Open layers panel', group: 'View', icon: 'layers', run: () => setLayersPanelOpen(true) },
  ], [controls, loadScenarioById, onResetCamera, setHelpOpen, setLayersPanelOpen, setModule, setSettingsOpen, toggleLayer]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return commands;
    return commands.filter((command) => `${command.label} ${command.group}`.toLowerCase().includes(needle));
  }, [commands, query]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setSelected(0);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => setSelected(0), [query]);

  const execute = (command: Command | undefined) => {
    if (!command) return;
    command.run();
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelected((value) => Math.min(value + 1, filtered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelected((value) => Math.max(value - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      execute(filtered[selected]);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-black/60 pt-[12vh] backdrop-blur-sm" role="presentation" onMouseDown={() => setOpen(false)}>
      <div
        className="aether-panel w-[min(92vw,600px)] overflow-hidden shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-[var(--aether-border)] px-3">
          <Icon name="search" size={15} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, modules, layers, scenarios…"
            aria-label="Search commands"
            className="h-11 flex-1 bg-transparent text-[12px] outline-none placeholder:text-[var(--aether-text-dim)]"
          />
          <kbd className="aether-mono rounded border border-[var(--aether-border)] px-1.5 py-0.5 text-[9px] text-[var(--aether-text-dim)]">ESC</kbd>
        </div>
        <div className="aether-scroll max-h-[52vh] overflow-y-auto p-1.5" role="listbox">
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center text-[11px] text-[var(--aether-text-dim)]">No matching commands</div>
          ) : filtered.map((command, index) => (
            <button
              key={command.id}
              type="button"
              role="option"
              aria-selected={index === selected}
              onMouseEnter={() => setSelected(index)}
              onClick={() => execute(command)}
              className={`flex w-full items-center gap-2.5 rounded-[4px] px-2.5 py-2 text-left text-[11px] ${index === selected ? 'bg-[rgba(72,201,232,0.12)] text-[var(--aether-text)]' : 'text-[var(--aether-text-muted)]'}`}
            >
              <Icon name={command.icon} size={14} className="shrink-0 text-[var(--aether-accent)]" />
              <span className="flex-1 truncate">{command.label}</span>
              <span className="aether-label">{command.group}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
