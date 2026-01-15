# Project Context

## Purpose
M-VAVE Tank G v2 preset converter - a Python tool to convert between the binary `.tkg` preset format used by the M-VAVE Tank G multi-guitar pedal and human-readable YAML format.

## Tech Stack
- Python 3.10+
- PyYAML for YAML parsing/generation
- No external binary dependencies

## Project Conventions

### Code Style
- Follow PEP 8
- Type hints for all public functions
- Docstrings for modules and public classes/functions

### Architecture Patterns
- Single `converter.py` module for core logic
- Separate data model classes for preset structure
- CLI interface in `__main__.py`

### Testing Strategy
- Unit tests with pytest
- Test presets in `presets/` folder serve as integration test fixtures

### Git Workflow
- Feature branches with descriptive names
- Conventional commits

## Domain Context

### Tank G Preset Format
The M-VAVE Tank G v2 uses a 21-byte binary preset format (`.tkg` extension):

| Byte | Parameter | Range | Notes |
|------|-----------|-------|-------|
| 0 | amp_on | 0-1 | Effect on/off toggle |
| 1 | mod_on | 0-1 | Effect on/off toggle |
| 2 | delay_on | 0-1 | Effect on/off toggle |
| 3 | reverb_on | 0-1 | Effect on/off toggle |
| 4 | noise_gate | 0-127 | |
| 5 | amp_model | 0-8 | 9 amp models |
| 6 | amp_gain | 0-127 | Display: value+1 |
| 7 | amp_treble | 0-127 | Display: value+1 |
| 8 | amp_middle | 0-127 | Display: value+1 |
| 9 | amp_bass | 0-127 | Display: value+1 |
| 10 | amp_volume | 0-127 | |
| 11 | mod_fx | 0-127 | Encoded: type (1-3) + value (0-40) |
| 12 | mod_speed | 0-127 | Display: value+1 |
| 13 | delay_mix | 0-127 | Encoded: type (1-3) + value (0-40) |
| 14 | delay_time | 0-127 | Display: value+1 |
| 15 | reverb_decay | 0-127 | Encoded: type (1-3) + value (0-40) |
| 16 | reverb_mix | 0-127 | Display: value+1 |
| 17 | ir_cab | 0-8 | 0=off, 1-8=cabinet number |
| 18-20 | footer | - | Always 0xFE 0xFE 0x7E |

### Encoded Parameters
Some parameters (mod_fx, delay_mix, reverb_decay) encode both effect type and parameter value in a single byte. The encoding maps 3 effect types with ~41 values each into the 0-127 range.

### Amp Models (9 total)
1. Clean
2. Crunch
3. Hi-Gain
4. Metal
5. Acoustic
6. Bass
7. British
8. American
9. Boutique

### IR Cabinets (8 total)
Numbered 1-8, selectable via ir_cab parameter (0 = off)

## Important Constraints
- Preset file must always be exactly 21 bytes
- Footer must be 0xFE 0xFE 0x7E
- All parameter values must fit in single byte (0-127 max)

## External Dependencies
- M-VAVE Tank G v2 desktop app for preset management (reference implementation)
