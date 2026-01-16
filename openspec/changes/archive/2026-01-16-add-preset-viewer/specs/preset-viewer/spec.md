## ADDED Requirements

### Requirement: Visual Preset Display
The system SHALL display Tank G presets as a visual pedal interface with rotary knobs.

#### Scenario: Display preset parameters as knobs
- **WHEN** a preset is loaded
- **THEN** all parameters are shown as rotary knobs at their correct positions
- **AND** knob rotation visually represents the parameter value (0-127 range = 0-270 degree rotation)

### Requirement: Effect Sections Layout
The system SHALL organize controls into sections matching the physical pedal.

#### Scenario: AMP section display
- **WHEN** viewing AMP section
- **THEN** model selector, gain, treble, middle, bass, volume knobs are displayed
- **AND** on/off toggle is shown with current state

#### Scenario: MOD section display
- **WHEN** viewing MOD section
- **THEN** type selector (Chorus/Phaser/Tremolo), depth, speed knobs are displayed
- **AND** on/off toggle is shown with current state

#### Scenario: DELAY section display
- **WHEN** viewing DELAY section
- **THEN** type selector (Digital/Analog/Tape), mix, time knobs are displayed
- **AND** on/off toggle is shown with current state

#### Scenario: REVERB section display
- **WHEN** viewing REVERB section
- **THEN** type selector (Room/Hall/Plate), decay, mix knobs are displayed
- **AND** on/off toggle is shown with current state

### Requirement: Interactive Knobs
The system SHALL allow users to adjust parameters by interacting with knobs.

#### Scenario: Drag knob to change value
- **WHEN** user drags a knob clockwise
- **THEN** the parameter value increases
- **AND** the knob visually rotates to the new position

#### Scenario: Display current value
- **WHEN** user hovers over or adjusts a knob
- **THEN** the current numeric value is displayed

### Requirement: LED Color Display
The system SHALL display the preset LED color.

#### Scenario: Show LED color preview
- **WHEN** a preset is loaded
- **THEN** the RGB color is displayed as a colored LED indicator
- **AND** user can modify the color via color picker

### Requirement: Additional Controls Display
The system SHALL display noise gate and IR cabinet controls.

#### Scenario: Noise gate knob
- **WHEN** viewing the interface
- **THEN** noise gate is shown as a rotary knob (0-127)

#### Scenario: IR cabinet selector
- **WHEN** viewing the interface
- **THEN** IR cabinet selector shows options Off, 1-8

### Requirement: File Operations
The system SHALL support loading and saving preset files.

#### Scenario: Load YAML preset
- **WHEN** user selects a .yaml file
- **THEN** the preset is parsed and displayed

#### Scenario: Load TKG preset
- **WHEN** user selects a .tkg file
- **THEN** the binary preset is parsed and displayed

#### Scenario: Export to YAML
- **WHEN** user clicks export to YAML
- **THEN** current settings are saved as a .yaml file

#### Scenario: Export to TKG
- **WHEN** user clicks export to TKG
- **THEN** current settings are saved as a .tkg binary file
