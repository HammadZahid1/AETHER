export interface AtmosphericLayer {
  id: string;
  name: string;
  baseKm: number;
  topKm: number;
  temperature: string;
  color: string;
  description: string;
  phenomena: string;
}

/** Scientific reference data for atmospheric layer visualization. */
export const ATMOSPHERIC_LAYERS: readonly AtmosphericLayer[] = [
  {
    id: 'troposphere', name: 'Troposphere', baseKm: 0, topKm: 12, temperature: '-60 to 15 °C',
    color: '#48c9e8', description: 'The lowest layer, containing most weather phenomena and the majority of atmospheric mass.',
    phenomena: 'Clouds, rain, storms, wind',
  },
  {
    id: 'stratosphere', name: 'Stratosphere', baseKm: 12, topKm: 50, temperature: '-3 to 15 °C',
    color: '#7aa9e8', description: 'A stably stratified layer where temperature rises with altitude due to ozone absorption.',
    phenomena: 'Ozone layer, jet streams',
  },
  {
    id: 'mesosphere', name: 'Mesosphere', baseKm: 50, topKm: 85, temperature: '-90 °C',
    color: '#8b7ce8', description: 'The coldest atmospheric layer, where most meteors burn up on entry.',
    phenomena: 'Meteors, noctilucent clouds',
  },
  {
    id: 'thermosphere', name: 'Thermosphere', baseKm: 85, topKm: 600, temperature: 'up to 1500 °C',
    color: '#b06ce8', description: 'A very thin, high-energy layer where aurora and satellite drag occur.',
    phenomena: 'Aurora, ionosphere',
  },
  {
    id: 'exosphere', name: 'Exosphere', baseKm: 600, topKm: 10000, temperature: 'highly variable',
    color: '#d08cf0', description: 'The outermost transition region where atoms escape into space.',
    phenomena: 'Escaping atoms, satellites',
  },
];

export function layerById(id: string): AtmosphericLayer {
  return ATMOSPHERIC_LAYERS.find((layer) => layer.id === id) ?? ATMOSPHERIC_LAYERS[0];
}