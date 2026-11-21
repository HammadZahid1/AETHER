# AETHER

**Interactive Earth & atmosphere simulation workspace**

> AETHER is an educational simulation. Every field, particle, trajectory and dataset is generated locally from deterministic algorithms. All values are simulated or illustrative and **must not be used for forecasting, navigation, emergency planning or operational decisions**.

AETHER is a browser-only application for exploring Earth-system ideas. It combines an interactive 3D globe with configurable wind, temperature, pressure, cloud, precipitation, storm, ocean and climate laboratories. There is no backend, no account system, no API key and no cloud dependency: the entire simulation runs in the browser after the static assets have loaded.

## Highlights

- Interactive globe with camera presets, coordinate inspection and layered overlays.
- Ten navigation modules; eight of them produce sampled simulation output.
- Deterministic clock with play, pause, stop, step, speed, direction and timeline seeking.
- Layer visibility, opacity and intensity controls plus curated layer presets.
- Ten bundled scenarios and a browser for searching, filtering, importing and exporting setups.
- Local persistence for settings, saved configurations and saved camera views.
- Command palette, keyboard shortcuts, dialogs with focus management, responsive controls and ARIA live notifications.
- Procedural textures and fields generated in-browser; no external imagery or observational data.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- A modern browser; WebGL2 is recommended, with a readable non-WebGL fallback when a context cannot be created

## Quick start

```bash
git clone https://github.com/HammadZahid1/AETHER.git
cd AETHER
npm install
npm run dev
```

Vite prints the local development URL, usually `http://localhost:5173`. Open that URL in a browser. No environment variables, API keys or services are required.
