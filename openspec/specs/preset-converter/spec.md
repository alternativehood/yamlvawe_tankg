# preset-converter Specification

## Purpose
TBD - created by archiving change add-preset-converter. Update Purpose after archive.
## Requirements
### Requirement: Binary Preset Parsing
The system SHALL parse M-VAVE Tank G v2 `.tkg` binary preset files into structured data.

#### Scenario: Parse valid preset file
- **WHEN** a valid 21-byte `.tkg` file is provided
- **THEN** all parameters are extracted with correct values
- **AND** the footer bytes (0xFE 0xFE 0x7E) are validated

#### Scenario: Reject invalid preset file
- **WHEN** a file with incorrect size or invalid footer is provided
- **THEN** a descriptive error is raised

### Requirement: Binary Preset Writing
The system SHALL serialize preset data back to valid `.tkg` binary format.

#### Scenario: Write valid preset file
- **WHEN** valid preset data is provided
- **THEN** a 21-byte `.tkg` file is created
- **AND** the file includes the correct footer bytes

#### Scenario: Validate parameter ranges
- **WHEN** a parameter value exceeds its valid range
- **THEN** a validation error is raised before writing

### Requirement: YAML Serialization
The system SHALL convert preset data to human-readable YAML format.

#### Scenario: Generate readable YAML
- **WHEN** preset data is serialized to YAML
- **THEN** parameters are organized by effect section (amp, mod, delay, reverb)
- **AND** parameter names are human-readable
- **AND** encoded parameters (mod_fx, delay_mix, reverb_decay) are decoded to type+value

### Requirement: YAML Deserialization
The system SHALL parse YAML preset files back into preset data.

#### Scenario: Parse valid YAML preset
- **WHEN** a valid YAML preset file is provided
- **THEN** all parameters are extracted and validated
- **AND** encoded parameters are re-encoded to single byte values

### Requirement: Round-trip Conversion
The system SHALL support lossless round-trip conversion between formats.

#### Scenario: TKG to YAML to TKG
- **WHEN** a `.tkg` file is converted to YAML and back to `.tkg`
- **THEN** the resulting binary file is byte-identical to the original

### Requirement: CLI Interface
The system SHALL provide a command-line interface for preset conversion.

#### Scenario: Convert TKG to YAML
- **WHEN** user runs `python -m yamlvawe_tankg tkg2yaml input.tkg output.yaml`
- **THEN** the preset is converted and saved to the output file

#### Scenario: Convert YAML to TKG
- **WHEN** user runs `python -m yamlvawe_tankg yaml2tkg input.yaml output.tkg`
- **THEN** the preset is converted and saved to the output file

#### Scenario: Batch conversion
- **WHEN** user provides a directory path
- **THEN** all matching files in the directory are converted

