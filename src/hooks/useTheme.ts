import { useEffect } from 'react';
import { useAetherStore } from '@/state/store';

/** Apply stored theme and motion preferences to the document root. */
export function useTheme(): void {
  const theme = useAetherStore((state) => state.settings.theme);
  const reducedMotion = useAetherStore((state) => state.settings.reducedMotion);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.reducedMotion = reducedMotion ? 'true' : 'false';
  }, [theme, reducedMotion]);
}
