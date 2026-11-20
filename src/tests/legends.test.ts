import { describe, expect, it } from 'vitest';
import { createDefaultConfigurations } from '@/data/defaults';
import { moduleLegend } from '@/renderer/legends';
import { MODULE_IDS } from '@/types/simulation';

describe('module legends', () => {
  const configurations = createDefaultConfigurations();

  it('provides a legend for every module', () => {
    for (const id of MODULE_IDS) {
      const legend = moduleLegend(id, configurations);
      expect(legend.title.length).toBeGreaterThan(0);
      expect(legend.gradient).toContain('gradient');
    }
  });

  it('uses configured temperature bounds', () => {
    const legend = moduleLegend('temperature', {
      ...configurations,
      temperature: { ...configurations.temperature, scaleMin: -50, scaleMax: 50 },
    });
    expect(legend.min).toBe('-50 °C');
    expect(legend.max).toBe('50 °C');
  });
});
