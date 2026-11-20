import { formatCoordinates } from '@/engine/coordinates';
import type { SimulationModules } from '@/engine/simulationModules';
import type { GeoCoordinates } from '@/types/geo';
import type { SimulationModuleId } from '@/types/simulation';

export interface InspectionRow {
  label: string;
  value: string;
}

/** Build a compact local readout for the active simulation module. */
export function inspectActiveModule(
  modules: SimulationModules | null,
  module: SimulationModuleId,
  coordinates: GeoCoordinates,
  time = 0,
): InspectionRow[] {
  const { latitude, longitude } = coordinates;
  const rows: InspectionRow[] = [
    { label: 'Position', value: formatCoordinates(coordinates, 2) },
  ];
  if (!modules) return rows;
  const number = (value: number, digits = 1) => Number.isFinite(value) ? value.toFixed(digits) : '—';

  switch (module) {
    case 'wind': {
      const sample = modules.wind.sample(latitude, longitude, time);
      rows.push({ label: 'Speed', value: `${number(sample.speed)} m/s` });
      rows.push({ label: 'Direction', value: `${number(sample.direction, 0)}°` });
      break;
    }
    case 'temperature': {
      const sample = modules.temperature.describe(latitude, longitude, time);
      rows.push({ label: 'Temperature', value: `${number(sample.temperature)} °C` });
      rows.push({ label: 'Band', value: sample.band });
      break;
    }
    case 'pressure': {
      const sample = modules.pressure.inspect(latitude, longitude, time);
      rows.push({ label: 'Pressure', value: `${number(sample.value)} hPa` });
      rows.push({ label: 'Category', value: sample.category });
      break;
    }
    case 'clouds': {
      const sample = modules.clouds.inspect(latitude, longitude, time);
      rows.push({ label: 'Density', value: number(sample.density, 2) });
      rows.push({ label: 'Altitude', value: `${number(sample.altitude, 2)} units` });
      break;
    }
    case 'precipitation': {
      const sample = modules.precipitation.inspect(latitude, longitude, time);
      rows.push({ label: 'Intensity', value: number(sample.value, 2) });
      rows.push({ label: 'Category', value: sample.category });
      break;
    }
    case 'storm': {
      const sample = modules.storm.inspect(latitude, longitude, time);
      rows.push({ label: 'Pressure', value: `${number(sample.pressure)} hPa` });
      rows.push({ label: 'Category', value: sample.category });
      break;
    }
    case 'ocean': {
      const sample = modules.ocean.sample(latitude, longitude, time);
      rows.push({ label: 'Current', value: `${number(sample.speed)} m/s` });
      rows.push({ label: 'Temperature', value: `${number(sample.temperature)} °C` });
      break;
    }
    case 'climate': {
      const sample = modules.climate.inspect(latitude, longitude);
      rows.push({ label: sample.dataset, value: `${number(sample.value)} ${sample.unit}` });
      rows.push({ label: 'Zone', value: sample.zone });
      break;
    }
    case 'earth':
    case 'atmosphere':
      rows.push({ label: 'Surface', value: 'Illustrative procedural globe' });
      break;
    default:
      break;
  }
  return rows;
}
