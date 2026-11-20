import type { SVGProps } from 'react';

export type IconName =
  | 'globe' | 'wind' | 'temperature' | 'pressure' | 'cloud' | 'rain' | 'storm'
  | 'ocean' | 'climate' | 'layers' | 'settings' | 'help' | 'play' | 'pause'
  | 'stop' | 'reset' | 'fullscreen' | 'chevronLeft' | 'chevronRight' | 'chevronDown'
  | 'search' | 'plus' | 'trash' | 'download' | 'upload' | 'save' | 'eye' | 'eyeOff'
  | 'crosshair' | 'camera' | 'clock' | 'menu' | 'close' | 'check' | 'info'
  | 'reverse' | 'forward' | 'grid' | 'sparkles' | 'sliders' | 'compass';

const PATHS: Record<IconName, string> = {
  globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM2 12h20M12 2c3 3 3 17 0 20M12 2c-3 3-3 17 0 20',
  wind: 'M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8a2.5 2.5 0 1 1-2.5 2.5',
  temperature: 'M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0Z',
  pressure: 'M4 18c3-8 5-8 8 0s5 8 8 0M4 6h16',
  cloud: 'M7 18h10a4 4 0 0 0 .4-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 18Z',
  rain: 'M7 15h10a4 4 0 0 0 .4-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 15ZM8 19v2M12 19v2M16 19v2',
  storm: 'M6 15a4 4 0 0 1 .5-7.9 6 6 0 0 1 11.4 1.6A3.5 3.5 0 0 1 18 15M13 13l-3 4h3l-2 4',
  ocean: 'M3 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0',
  climate: 'M3 19h18M5 19V9l5-4 4 5 5-3v12M8 19v-5h4v5',
  layers: 'm12 3 9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 17l9 5 9-5',
  settings: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19 12l2-1-2-3.5-2.2.7a7 7 0 0 0-1.7-1L15 4h-4l-.8 3.2a7 7 0 0 0-1.7 1L6 7.5 4 11l2 1a7 7 0 0 0 0 2l-2 1 2 3.5 2.2-.7a7 7 0 0 0 1.7 1L11 22h4l.8-3.2a7 7 0 0 0 1.7-1L19 19l2-3.5-2-1a7 7 0 0 0 0-2Z',
  help: 'M12 17h.01M9.5 9a2.5 2.5 0 1 1 4 2c-.9.7-1.5 1.2-1.5 2.5M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
  play: 'm8 5 11 7-11 7V5Z',
  pause: 'M8 5v14M16 5v14',
  stop: 'M6 6h12v12H6z',
  reset: 'M3 12a9 9 0 1 0 3-6.7M3 4v5h5',
  fullscreen: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  chevronLeft: 'm15 18-6-6 6-6',
  chevronRight: 'm9 18 6-6-6-6',
  chevronDown: 'm6 9 6 6 6-6',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3',
  plus: 'M12 5v14M5 12h14',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14',
  download: 'M12 3v12M7 10l5 5 5-5M4 21h16',
  upload: 'M12 17V5M7 10l5-5 5 5M4 21h16',
  save: 'M5 3h12l4 4v14H5V3ZM8 3v6h8V3M8 21v-7h8v7',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  eyeOff: 'M3 3l18 18M10.6 5.2A10 10 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3 3.7M6 6.5A17 17 0 0 0 2 12s4 7 10 7a10 10 0 0 0 4-.8',
  crosshair: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 2v5M12 17v5M2 12h5M17 12h5',
  camera: 'M4 7h4l2-3h4l2 3h4v13H4V7ZM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M5 5l14 14M19 5 5 19',
  check: 'm5 12 4 4L19 6',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v6M12 7h.01',
  reverse: 'm11 6-8 6 8 6V6ZM21 6l-8 6 8 6V6Z',
  forward: 'm13 6 8 6-8 6V6ZM3 6l8 6-8 6V6Z',
  grid: 'M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18',
  sparkles: 'm12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z',
  sliders: 'M4 7h10M18 7h2M4 17h4M12 17h8M14 4v6M8 14v6',
  compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM15.5 8.5l-2 5-5 2 2-5 5-2Z',
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 16, strokeWidth = 1.6, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}