# Change: Add TKG to YAML preset converter

## Why
The M-VAVE Tank G v2 stores presets in a proprietary 21-byte binary format (`.tkg`). Users cannot easily view, edit, share, or version-control their presets. A YAML-based format would make presets human-readable and editable.

## What Changes
- Add Python converter module to parse `.tkg` binary files into structured data
- Add YAML serialization/deserialization for preset data
- Add CLI interface for conversion in both directions (tkg->yaml, yaml->tkg)
- Add data.json mapping file documenting byte positions and parameter metadata
- Organize sample presets into categorized folders for testing

## Impact
- New capability: `preset-converter`
- New files: `converter.py`, `__main__.py`, `data.json`
- Presets reorganized into `presets/` subdirectories by parameter type
