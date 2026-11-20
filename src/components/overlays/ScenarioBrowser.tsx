import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { SCENARIOS } from '@/data/scenarios';
import { exportScenario, importScenario } from '@/engine/scenarios';
import { useAetherStore } from '@/state/store';

interface ScenarioBrowserProps {
  open: boolean;
  onClose: () => void;
}

/** Browse built-in scenarios and manage locally saved configurations. */
export function ScenarioBrowser({ open, onClose }: ScenarioBrowserProps) {
  const [importText, setImportText] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const loadScenarioById = useAetherStore((state) => state.loadScenarioById);
  const saved = useAetherStore((state) => state.savedConfigurations);
  const activeScenarioId = useAetherStore((state) => state.activeScenarioId);
  const saveCurrentConfiguration = useAetherStore((state) => state.saveCurrentConfiguration);
  const getCurrentScenario = useAetherStore((state) => state.getCurrentScenario);
  const loadSavedConfiguration = useAetherStore((state) => state.loadSavedConfiguration);
  const removeSavedConfiguration = useAetherStore((state) => state.removeSavedConfiguration);
  const renameSavedConfiguration = useAetherStore((state) => state.renameSavedConfiguration);
  const duplicateSavedConfiguration = useAetherStore((state) => state.duplicateSavedConfiguration);
  const importSavedConfiguration = useAetherStore((state) => state.importSavedConfiguration);
  const applyScenario = useAetherStore((state) => state.applyScenario);
  const notify = useAetherStore((state) => state.notify);

  const categories = [...new Set(SCENARIOS.map((scenario) => scenario.category))].sort();
  const needle = query.trim().toLowerCase();
  const visibleScenarios = SCENARIOS.filter((scenario) => {
    const matchesCategory = category === 'all' || scenario.category === category;
    const matchesQuery = !needle || `${scenario.name} ${scenario.description} ${scenario.category}`.toLowerCase().includes(needle);
    return matchesCategory && matchesQuery;
  });

  const downloadScenario = (scenario: (typeof SCENARIOS)[number]) => {
    const blob = new Blob([exportScenario(scenario)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${scenario.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const download = (id: string) => {
    const scenario = SCENARIOS.find((item) => item.id === id);
    if (scenario) downloadScenario(scenario);
  };

  const importConfiguration = () => {
    const result = importScenario(importText);
    if (!result.saved) {
      setErrors(result.errors);
      return;
    }
    importSavedConfiguration(result.saved);
    const validation = importScenario(importText);
    if (validation.saved) applyScenario(validation.saved.scenario);
    setErrors([]);
    setImportText('');
    notify(`Imported scenario “${result.saved.name}”`, 'success');
  };

  return (
    <Dialog open={open} onClose={onClose} title="Scenarios" subtitle="Deterministic starting conditions and saved configurations" width="max-w-3xl">
      <div className="space-y-5">
        <section className="flex gap-2">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search scenarios"
            placeholder="Search scenarios by name, description or category…"
            className="aether-mono w-full rounded border border-[var(--aether-border)] bg-[var(--aether-bg-raised)] px-2 py-1.5 text-[10px] outline-none"
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter scenarios by category"
            className="aether-mono w-36 rounded border border-[var(--aether-border)] bg-[var(--aether-bg-raised)] px-2 py-1.5 text-[10px] outline-none"
          >
            <option value="all">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </section>

        <section className="grid gap-2 sm:grid-cols-2">
          {visibleScenarios.map((scenario) => (
            <div key={scenario.id} className="aether-panel p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-semibold text-[var(--aether-text)]">{scenario.name}</div>
                  <p className="mt-1 text-[10px] leading-snug text-[var(--aether-text-dim)]">{scenario.description}</p>
                </div>
                {activeScenarioId === scenario.id ? <Badge tone="accent">Active</Badge> : null}
              </div>
              <div className="mt-2 flex gap-1.5">
                <Button size="sm" variant="ghost" icon="play" onClick={() => { loadScenarioById(scenario.id); onClose(); }}>Load</Button>
                <Button size="sm" variant="ghost" icon="download" onClick={() => download(scenario.id)}>Export</Button>
              </div>
            </div>
          ))}
          {visibleScenarios.length === 0 ? (
            <p className="text-[11px] text-[var(--aether-text-dim)]">No scenarios match the current filters.</p>
          ) : null}
        </section>

        <section className="border-t border-[var(--aether-border)] pt-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="aether-label">Saved configurations</h3>
            <div className="flex gap-1.5">
              <Button size="sm" variant="ghost" icon="download" onClick={() => downloadScenario(getCurrentScenario())}>Export current</Button>
              <Button size="sm" variant="ghost" icon="plus" onClick={() => saveCurrentConfiguration(`Configuration ${saved.length + 1}`)}>Save current</Button>
            </div>
          </div>
          {saved.length === 0 ? (
            <p className="text-[11px] text-[var(--aether-text-dim)]">No configurations saved in this browser.</p>
          ) : (
            <div className="space-y-1.5">
              {saved.map((item) => (
                <div key={item.id} className="flex items-center gap-2 rounded border border-[var(--aether-border)] px-2.5 py-1.5">
                  <Icon name="save" size={13} className="shrink-0 text-[var(--aether-accent)]" />
                  {renamingId === item.id ? (
                    <>
                      <input
                        autoFocus
                        value={renameText}
                        onChange={(event) => setRenameText(event.target.value)}
                        aria-label={`Rename ${item.name}`}
                        className="aether-mono min-w-0 flex-1 rounded border border-[var(--aether-border)] bg-[var(--aether-bg-raised)] px-1.5 py-1 text-[10px] outline-none"
                      />
                      <Button size="sm" variant="ghost" onClick={() => {
                        if (renameText.trim()) renameSavedConfiguration(item.id, renameText.trim());
                        setRenamingId(null);
                      }}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setRenamingId(null)}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 truncate text-[11px]">{item.name}</span>
                      <Button size="sm" variant="ghost" onClick={() => {
                        setRenamingId(item.id);
                        setRenameText(item.name);
                      }}>Rename</Button>
                      <Button size="sm" variant="ghost" icon="plus" aria-label={`Duplicate ${item.name}`} onClick={() => duplicateSavedConfiguration(item.id)} />
                      <Button size="sm" variant="ghost" onClick={() => { loadSavedConfiguration(item.id); onClose(); }}>Load</Button>
                      <Button size="sm" variant="ghost" icon="trash" onClick={() => removeSavedConfiguration(item.id)} aria-label={`Delete ${item.name}`} />
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="border-t border-[var(--aether-border)] pt-4">
          <h3 className="aether-label mb-2">Import scenario JSON</h3>
          <textarea
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            aria-label="Scenario JSON"
            placeholder="Paste an exported scenario configuration…"
            rows={4}
            className="aether-mono w-full rounded border border-[var(--aether-border)] bg-[var(--aether-bg-raised)] p-2 text-[10px] outline-none"
          />
          {errors.length ? (
            <ul className="mt-1.5 space-y-0.5 text-[10px] text-[var(--aether-danger)]">
              {errors.map((error) => <li key={error}>{error}</li>)}
            </ul>
          ) : null}
          <div className="mt-2">
            <Button size="sm" icon="upload" onClick={importConfiguration} disabled={!importText.trim()}>Import</Button>
          </div>
        </section>
      </div>
    </Dialog>
  );
}
