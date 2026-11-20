import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { MODULE_GROUPS, MODULES, MODULE_MAP, type ModuleMeta } from '@/data/modules';
import { useAetherStore } from '@/state/store';

const GROUP_ORDER: ModuleMeta['group'][] = ['explore', 'atmosphere', 'surface', 'advanced'];

interface LeftNavProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function LeftNav({ mobileOpen, onMobileClose }: LeftNavProps) {
  const activeModule = useAetherStore((state) => state.activeModule);
  const setModule = useAetherStore((state) => state.setModule);
  const collapsed = useAetherStore((state) => state.settings.sidebarCollapsed);
  const updateSettings = useAetherStore((state) => state.updateSettings);
  const [query, setQuery] = useState('');

  const needle = query.trim().toLowerCase();
  const visibleGroups = GROUP_ORDER.map((group) => ({
    group,
    modules: MODULES.filter((module) => module.group === group && (
      !needle || `${module.label} ${module.description} ${module.id}`.toLowerCase().includes(needle)
    )),
  })).filter((entry) => entry.modules.length > 0);

  const select = (id: ModuleMeta['id']) => {
    setModule(id);
    onMobileClose();
  };

  return (
    <aside
      className={`${mobileOpen ? 'fixed inset-y-0 left-0 z-50 flex' : 'hidden'} ${collapsed ? 'md:w-[58px]' : 'md:w-[212px]'} md:relative md:flex w-[236px] shrink-0 flex-col border-r border-[var(--aether-border)] bg-[rgba(8,11,18,0.94)] transition-[width] duration-200`}
    >
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[var(--aether-border)] px-2.5">
        {!collapsed ? <span className="aether-label">Simulation Modules</span> : <span className="aether-label">MOD</span>}
        <div className="flex items-center gap-0.5">
          <IconButton icon="close" label="Close navigation" onClick={onMobileClose} className="md:hidden" />
          <IconButton
            icon="chevronLeft"
            label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            onClick={() => updateSettings({ sidebarCollapsed: !collapsed })}
            className={`hidden md:inline-flex transition-transform ${collapsed ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      <nav aria-label="Simulation modules" className="aether-scroll flex-1 overflow-y-auto px-1.5 py-2">
        {!collapsed ? (
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search modules"
            placeholder="Search modules…"
            className="aether-mono mb-2 w-full rounded border border-[var(--aether-border)] bg-[var(--aether-bg-raised)] px-2 py-1.5 text-[10px] outline-none"
          />
        ) : null}
        {visibleGroups.map(({ group, modules }) => (
          <div key={group} className="mb-3">
            {!collapsed ? <div className="aether-label mb-1.5 px-2">{MODULE_GROUPS[group]}</div> : <div className="mx-2 mb-2 border-t border-[var(--aether-border)]" />}
            <div className="space-y-0.5">
              {modules.map((module) => {
                const active = activeModule === module.id;
                const button = (
                  <button
                    key={module.id}
                    type="button"
                    aria-current={active ? 'page' : undefined}
                    onClick={() => select(module.id)}
                    className={`group relative flex w-full items-center gap-2.5 rounded-[4px] px-2 py-[7px] text-left text-[11px] transition-colors ${
                      active
                        ? 'bg-[rgba(72,201,232,0.1)] text-[var(--aether-accent)]'
                        : 'text-[var(--aether-text-muted)] hover:bg-white/[0.04] hover:text-[var(--aether-text)]'
                    } ${collapsed ? 'justify-center px-0' : ''}`}
                  >
                    {active ? <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-[var(--aether-accent)]" /> : null}
                    <Icon name={module.icon} size={15} className="shrink-0" />
                    {!collapsed ? (
                      <>
                        <span className="truncate font-medium">{module.label}</span>
                        {active ? <span className="ml-auto h-1 w-1 rounded-full bg-current" /> : null}
                      </>
                    ) : null}
                  </button>
                );
                return collapsed ? (
                  <Tooltip key={module.id} content={module.label} side="right">{button}</Tooltip>
                ) : button;
              })}
            </div>
          </div>
        ))}
      </nav>

      {!collapsed ? (
        <div className="shrink-0 border-t border-[var(--aether-border)] p-2.5">
          <div className="aether-panel bg-white/[0.02] p-2.5">
            <div className="aether-label mb-1.5">Active module</div>
            <div className="flex items-start gap-2">
              <Icon name={MODULE_MAP[activeModule].icon} size={14} className="mt-0.5 shrink-0 text-[var(--aether-accent)]" />
              <p className="text-[10px] leading-snug text-[var(--aether-text-dim)]">{MODULE_MAP[activeModule].description}</p>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}