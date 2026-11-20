import { Icon } from '@/components/ui/Icon';
import { MODULE_MAP } from '@/data/modules';
import { useAetherStore } from '@/state/store';
import { EarthControlPanel } from '@/components/panels/EarthControlPanel';
import { AtmosphereControlPanel } from '@/components/panels/AtmosphereControlPanel';
import { WindControlPanel } from '@/components/panels/WindControlPanel';
import { TemperatureControlPanel } from '@/components/panels/TemperatureControlPanel';
import { PressureControlPanel } from '@/components/panels/PressureControlPanel';
import { CloudControlPanel } from '@/components/panels/CloudControlPanel';
import { PrecipitationControlPanel } from '@/components/panels/PrecipitationControlPanel';
import { StormControlPanel } from '@/components/panels/StormControlPanel';
import { OceanControlPanel } from '@/components/panels/OceanControlPanel';
import { ClimateControlPanel } from '@/components/panels/ClimateControlPanel';

interface PanelRouterProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  onResetCamera: () => void;
}

export function PanelRouter({ mobileOpen, onMobileClose, onResetCamera }: PanelRouterProps) {
  const activeModule = useAetherStore((state) => state.activeModule);
  const module = MODULE_MAP[activeModule];

  const content = (() => {
    switch (activeModule) {
      case 'earth': return <EarthControlPanel onResetCamera={onResetCamera} />;
      case 'atmosphere': return <AtmosphereControlPanel />;
      case 'wind': return <WindControlPanel />;
      case 'temperature': return <TemperatureControlPanel />;
      case 'pressure': return <PressureControlPanel />;
      case 'clouds': return <CloudControlPanel />;
      case 'precipitation': return <PrecipitationControlPanel />;
      case 'storm': return <StormControlPanel />;
      case 'ocean': return <OceanControlPanel />;
      case 'climate': return <ClimateControlPanel />;
      default: return null;
    }
  })();

  return (
    <aside
      className={`${mobileOpen ? 'fixed inset-y-0 right-0 z-50 flex' : 'hidden'} lg:relative lg:flex w-[290px] xl:w-[312px] shrink-0 flex-col border-l border-[var(--aether-border)] bg-[rgba(8,11,18,0.94)]`}
    >
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[var(--aether-border)] px-3">
        <div className="flex min-w-0 items-center gap-2 text-[var(--aether-accent)]">
          <Icon name={module.icon} size={15} />
          <span className="truncate text-[11px] font-semibold tracking-wide">{module.label} · Controls</span>
        </div>
        <button type="button" aria-label="Close controls" onClick={onMobileClose} className="text-[var(--aether-text-dim)] lg:hidden">
          <Icon name="close" size={15} />
        </button>
      </div>
      <div className="aether-scroll flex-1 space-y-3 overflow-y-auto p-3">{content}</div>
    </aside>
  );
}