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

## Architecture

AETHER is a static Vite + React + TypeScript application. Tailwind CSS provides the design system, React Three Fiber and Three.js render the globe, Zustand holds UI state, and Vitest with React Testing Library covers domain logic and interfaces.

```text
src/
  App.tsx              application shell and overlay composition
  components/          layout, panels, overlays and reusable UI primitives
  data/                module metadata, defaults, presets, scenarios and reference tables
  engine/              clock, engine, coordinates, fields, noise, layers and validation
  hooks/               engine driving, theme and keyboard shortcuts
  renderer/            globe, atmosphere, overlays, layers and WebGL fallback
  simulations/         wind, temperature, pressure, clouds, rain, storm, ocean, climate
  state/               Zustand store and localStorage persistence
  tests/               unit and component tests
  types/               shared domain types
  utils/               formatting helpers
```

The `engine/` layer owns simulation time. `SimulationClock` produces a single frame context, and `SimulationEngine` passes that context to each active module in registration order. Module failures are captured and surfaced through diagnostics rather than crashing the application.

The eight output-producing simulations are registered once by `registerSimulationModules()` and exposed to renderers through `getSimulationModules()`. Panel edits are pushed into the same instances with `syncSimulationConfigurations()`, so changing a slider does not replace the clock or discard particles.

The renderer never fetches data. Procedural noise, analytic latitude bands, Gaussian pressure centers, gyres and deterministic rasterization provide values for textures, particles, contours and inspection records. Repeating the same settings and timeline produces the same values.

Zustand stores the active module, configurations, layer state, camera, playback state, notifications and locally saved artifacts. React components subscribe only to the slices they need; the simulation engine remains independent of React.

## Modules and controls

| Module | Purpose |
| --- | --- |
| Earth Explorer | Rotate the globe, inspect coordinates and select a surface point. |
| Atmosphere | Step through exaggerated shells from troposphere to exosphere. |
| Wind Lab | Animate a simplified global wind field as particles, streamlines or vectors. |
| Temperature Lab | Inspect a simulated thermal field with seasonal and day/night terms. |
| Pressure Systems | Place simulated highs and lows and display contours and gradients. |
| Cloud Laboratory | Shape procedural cloud layers with density, coverage and altitude controls. |
| Precipitation Lab | Visualize regional or global rainfall with falling particle drops. |
| Storm Lab | Build an illustrative rotating storm with spiral flow, rain and a track. |
| Ocean Explorer | Explore simplified gyres, equatorial currents and sea temperature. |
| Climate Lab | Compare bundled illustrative datasets across seasons. |

Drag the globe to rotate it, scroll or pinch to zoom, and click the surface to inspect the selected coordinate. The top bar provides fullscreen, settings, help, provenance and saved-view actions. The left navigation selects a module; the right panel exposes that module's parameters. The bottom timeline controls play, pause, stop, step, speed and direction. The layers panel controls visibility, opacity and intensity for all eleven overlay layers.

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Ctrl/⌘ + K` | Open the command palette |
| `Space` | Play or pause |
| `←` / `→` | Step the timeline backward or forward |
| `R` | Reset camera to the global view |
| `L` | Toggle the layers panel |
| `S` | Open the scenario browser |
| `?` | Toggle help |
| `Esc` | Close an open dialog or overlay |

Shortcuts are ignored while typing in an input, textarea, select or content-editable element. The command palette also exposes playback, camera, layer, diagnostics, scenario, saved-view and data-clearing commands.
