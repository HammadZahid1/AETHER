import type { LegendProps } from '@/components/ui/Legend';
import type { SimulationConfigurations } from '@/types/config';
import type { SimulationModuleId } from '@/types/simulation';

const GRADIENTS = {
  wind: 'linear-gradient(90deg,#3b7fd4,#4ad6c4,#f2dd65,#e8705c)',
  temperature: 'linear-gradient(90deg,#31509c,#49a7d8,#f4df70,#e55c48)',
  pressure: 'linear-gradient(90deg,#5d6fc4,#d7e5e9,#e6a85c,#d45555)',
  cloud: 'linear-gradient(90deg,rgba(255,255,255,0.05),rgba(255,255,255,0.9))',
  precipitation: 'linear-gradient(90deg,#203342,#4d9fd1,#c6ecff)',
  storm: 'linear-gradient(90deg,#5c62b8,#e8b35c,#e86c6c,#c46ee8)',
  ocean: 'linear-gradient(90deg,#254f9a,#35b6bd,#8ed9a1,#f0d47a)',
  climate: 'linear-gradient(90deg,#2d5fa6,#66b58b,#e9c45d,#d1634f)',
} as const;

/** Build a short legend describing the currently active color scale. */
export function moduleLegend(module: SimulationModuleId, configurations: SimulationConfigurations): LegendProps {
  switch (module) {
    case 'wind':
      return { title: 'Wind speed', min: '0 m/s', max: '26 m/s', gradient: GRADIENTS.wind, note: 'illustrative' };
    case 'temperature':
      return {
        title: 'Temperature',
        min: `${configurations.temperature.scaleMin} °C`,
        max: `${configurations.temperature.scaleMax} °C`,
        gradient: GRADIENTS.temperature,
        note: configurations.temperature.mode,
      };
    case 'pressure':
      return { title: 'Pressure', min: '975 hPa', max: '1050 hPa', gradient: GRADIENTS.pressure };
    case 'clouds':
      return { title: 'Cloud density', min: 'clear', max: 'dense', gradient: GRADIENTS.cloud };
    case 'precipitation':
      return { title: 'Precipitation', min: 'none', max: 'heavy', gradient: GRADIENTS.precipitation };
    case 'storm':
      return { title: 'Storm intensity', min: 'low', max: 'extreme', gradient: GRADIENTS.storm };
    case 'ocean':
      return { title: 'Sea temperature', min: '−2 °C', max: '32 °C', gradient: GRADIENTS.ocean };
    case 'climate':
      return { title: 'Climate dataset', min: 'low', max: 'high', gradient: GRADIENTS.climate, note: configurations.climate.dataset };
    default:
      return { title: 'Surface reference', min: 'ocean', max: 'land', gradient: GRADIENTS.ocean, note: 'procedural' };
  }
}
