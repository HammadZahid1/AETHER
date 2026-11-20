/** Human-readable formatting helpers for simulated values. */

/** Format a geographic coordinate with hemisphere suffixes and fixed precision. */
export function formatCoordinate(latitude: number, longitude: number): string {
  const lat = clampFinite(latitude, -90, 90);
  const lon = wrapLongitude(longitude);
  const latHemisphere = lat < 0 ? 'S' : 'N';
  const lonHemisphere = lon < 0 ? 'W' : 'E';
  return `${Math.abs(lat).toFixed(2)}° ${latHemisphere}, ${Math.abs(lon).toFixed(2)}° ${lonHemisphere}`;
}

/** Format a temperature in Celsius with its unit. */
export function formatTemperature(celsius: number, precision = 1): string {
  return `${clampFinite(celsius, -273, 1000).toFixed(precision)} °C`;
}

/** Format a wind speed in metres per second with its unit. */
export function formatWindSpeed(metresPerSecond: number, precision = 1): string {
  return `${Math.max(0, finite(metresPerSecond)).toFixed(precision)} m/s`;
}

/** Format an atmospheric pressure in hectopascals with its unit. */
export function formatPressure(hPa: number, precision = 0): string {
  return `${clampFinite(hPa, 0, 2000).toFixed(precision)} hPa`;
}

/** Format a normalized fraction as a percentage. */
export function formatPercent(fraction: number, precision = 0): string {
  return `${(clampFinite(fraction, 0, 1) * 100).toFixed(precision)}%`;
}

/** Wrap a longitude in degrees to the [-180, 180) range. */
export function wrapLongitude(longitude: number): number {
  const value = finite(longitude);
  return ((((value + 180) % 360) + 360) % 360) - 180;
}

function finite(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function clampFinite(value: number, min: number, max: number): number {
  return Math.min(Math.max(finite(value), min), max);
}
