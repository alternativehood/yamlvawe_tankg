# yamlvawe_tankg

A Python tool for converting M-VAVE Tank G v2 guitar pedal presets between the binary `.tkg` format and a human-readable YAML representation.

The project is designed to make Tank G presets inspectable, version-controllable, and scriptable.

Written using Claude Code.

---

## Purpose

M-VAVE Tank G v2 presets are stored as a fixed-size 21-byte binary format.  
This tool allows:

- Converting `.tkg` → YAML for inspection and editing
- Converting YAML → `.tkg` with strict validation
- Using presets as reproducible fixtures in tests and tooling
- Tracking meaningful diffs in Git instead of opaque binaries

---

## Project Structure

```
.
├── yamlvawe_tankg/        # Python package
│   ├── __main__.py        # CLI entry point
│   └── converter.py      # Core conversion logic
│
├── openspec/              # Formal project specification
│
├── AGENTS.md              # AI / automation interaction rules
├── CLAUDE.md              # Project-level generation constraints
├── .python-version        # Target Python version (pyenv)
└── .gitignore
```

---

## Requirements

- Python **3.10+**
- PyYAML

No external binary dependencies.

---

## Usage

### CLI

Run via module execution:

```bash
python -m yamlvawe_tankg <command> [options]
````

---

## Preset Format Overview

* Preset size: **exactly 21 bytes**
* File extension: `.tkg`

Key parameters include:

* Amp model, gain, EQ, volume
* Modulation (type + value encoding)
* Delay (type + mix + time)
* Reverb (type + mix + decay)
* Noise gate
* IR cabinet selection
* Preset number
* RGB

Some parameters encode **effect type + value** into a single byte; decoding and encoding rules are implemented in `converter.py`.

Full byte-level specification is documented in:

```
openspec/project.md
openspec/specs/preset-converter/spec.md
```

---

## Status

Early but functional.

---

## Disclaimer

This project is not affiliated with or endorsed by M-VAVE.
All trademarks belong to their respective owners.
