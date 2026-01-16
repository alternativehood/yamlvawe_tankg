# Change: Add Tank G Preset Viewer UI

## Why
Users currently can only view presets as YAML text. A visual UI that mimics the actual Tank G pedal layout with rotary knobs would make presets much easier to understand at a glance and more intuitive to edit.

## What Changes
- Add `tankg-preset-viewer` web-based UI component
- Visual representation of all preset parameters as rotary knobs
- Sections matching the actual pedal: AMP, MOD, DELAY, REVERB
- LED color preview
- IR cabinet and noise gate displays
- Load presets from .tkg or .yaml files
- Export modified presets back to .tkg or .yaml

## Impact
- New capability: `preset-viewer`
- New files: `viewer/index.html`, `viewer/style.css`, `viewer/app.js`
- Integration with existing converter module via Python HTTP server or standalone JS
