/**
 * Tank G Preset Viewer
 * Interactive viewer and editor for M-VAVE Tank G v2 presets
 */

// Constants
const PRESET_SIZE = 21;

const AMP_MODELS = {
    0: "Clean", 1: "Crunch", 2: "Hi-Gain", 3: "Metal", 4: "Acoustic",
    5: "Bass", 6: "British", 7: "American", 8: "Boutique"
};

const MOD_TYPES = { 1: "Chorus", 2: "Phaser", 3: "Tremolo" };
const DELAY_TYPES = { 1: "Digital", 2: "Analog", 3: "Tape" };
const REVERB_TYPES = { 1: "Room", 2: "Hall", 3: "Plate" };

// Current preset state
let currentPreset = {
    amp: { enabled: true, model: 4, gain: 61, treble: 126, middle: 114, bass: 94, volume: 60 },
    mod: { enabled: false, type: 1, depth: 1, speed: 1 },
    delay: { enabled: false, type: 1, mix: 1, time: 1 },
    reverb: { enabled: false, type: 1, decay: 1, mix: 90 },
    noiseGate: 0,
    irCab: 0,
    color: [0xFE, 0xFE, 0x7E]
};

// Knob state
let activeKnob = null;
let startY = 0;
let startValue = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initKnobs();
    initToggles();
    initSelectors();
    initColorPicker();
    initFileInput();
    updateUI();
});

// ==================== KNOB INTERACTION ====================

function initKnobs() {
    const knobs = document.querySelectorAll('.knob');

    knobs.forEach(knob => {
        knob.addEventListener('mousedown', startKnobDrag);
        knob.addEventListener('touchstart', startKnobDrag, { passive: false });
    });

    document.addEventListener('mousemove', dragKnob);
    document.addEventListener('touchmove', dragKnob, { passive: false });
    document.addEventListener('mouseup', stopKnobDrag);
    document.addEventListener('touchend', stopKnobDrag);

    // Mouse wheel support
    knobs.forEach(knob => {
        knob.addEventListener('wheel', (e) => {
            e.preventDefault();
            const param = knob.dataset.param;
            const min = parseInt(knob.dataset.min) || 0;
            const max = parseInt(knob.dataset.max) || 127;
            const currentValue = getParamValue(param);
            const delta = e.deltaY > 0 ? -1 : 1;
            const newValue = Math.max(min, Math.min(max, currentValue + delta));
            setParamValue(param, newValue);
            updateKnobDisplay(knob, newValue, min, max);
        });
    });
}

function startKnobDrag(e) {
    e.preventDefault();
    activeKnob = e.target.closest('.knob');
    if (!activeKnob) return;

    const param = activeKnob.dataset.param;
    startY = e.clientY || e.touches[0].clientY;
    startValue = getParamValue(param);
    activeKnob.style.cursor = 'grabbing';
}

function dragKnob(e) {
    if (!activeKnob) return;
    e.preventDefault();

    const currentY = e.clientY || (e.touches && e.touches[0].clientY);
    if (currentY === undefined) return;

    const param = activeKnob.dataset.param;
    const min = parseInt(activeKnob.dataset.min) || 0;
    const max = parseInt(activeKnob.dataset.max) || 127;
    const range = max - min;

    // Sensitivity: 200px drag = full range
    const delta = (startY - currentY) / 200 * range;
    const newValue = Math.round(Math.max(min, Math.min(max, startValue + delta)));

    setParamValue(param, newValue);
    updateKnobDisplay(activeKnob, newValue, min, max);
}

function stopKnobDrag() {
    if (activeKnob) {
        activeKnob.style.cursor = 'pointer';
        activeKnob = null;
    }
}

function updateKnobDisplay(knob, value, min, max) {
    // Update value label
    const container = knob.closest('.knob-control');
    const valueLabel = container.querySelector('.knob-value');
    if (valueLabel) {
        valueLabel.textContent = value;
    }

    // Update knob rotation (0° at min, 270° at max)
    const percent = (value - min) / (max - min);
    const rotation = -135 + (percent * 270);
    knob.style.setProperty('--rotation', `${rotation}deg`);

    // Apply rotation to the indicator
    const afterStyle = document.createElement('style');
    knob.style.transform = `rotate(${rotation}deg)`;
}

// ==================== PARAMETER MAPPING ====================

function getParamValue(param) {
    const mapping = {
        'amp-gain': () => currentPreset.amp.gain,
        'amp-treble': () => currentPreset.amp.treble,
        'amp-middle': () => currentPreset.amp.middle,
        'amp-bass': () => currentPreset.amp.bass,
        'amp-volume': () => currentPreset.amp.volume,
        'mod-depth': () => currentPreset.mod.depth,
        'mod-speed': () => currentPreset.mod.speed,
        'delay-mix': () => currentPreset.delay.mix,
        'delay-time': () => currentPreset.delay.time,
        'reverb-decay': () => currentPreset.reverb.decay,
        'reverb-mix': () => currentPreset.reverb.mix,
        'noise-gate': () => currentPreset.noiseGate
    };
    return mapping[param] ? mapping[param]() : 0;
}

function setParamValue(param, value) {
    const mapping = {
        'amp-gain': (v) => currentPreset.amp.gain = v,
        'amp-treble': (v) => currentPreset.amp.treble = v,
        'amp-middle': (v) => currentPreset.amp.middle = v,
        'amp-bass': (v) => currentPreset.amp.bass = v,
        'amp-volume': (v) => currentPreset.amp.volume = v,
        'mod-depth': (v) => currentPreset.mod.depth = v,
        'mod-speed': (v) => currentPreset.mod.speed = v,
        'delay-mix': (v) => currentPreset.delay.mix = v,
        'delay-time': (v) => currentPreset.delay.time = v,
        'reverb-decay': (v) => currentPreset.reverb.decay = v,
        'reverb-mix': (v) => currentPreset.reverb.mix = v,
        'noise-gate': (v) => currentPreset.noiseGate = v
    };
    if (mapping[param]) mapping[param](value);
}

// ==================== TOGGLES & SELECTORS ====================

function initToggles() {
    document.getElementById('amp-enabled').addEventListener('change', (e) => {
        currentPreset.amp.enabled = e.target.checked;
        updateSectionState('amp-section', e.target.checked);
    });

    document.getElementById('mod-enabled').addEventListener('change', (e) => {
        currentPreset.mod.enabled = e.target.checked;
        updateSectionState('mod-section', e.target.checked);
    });

    document.getElementById('delay-enabled').addEventListener('change', (e) => {
        currentPreset.delay.enabled = e.target.checked;
        updateSectionState('delay-section', e.target.checked);
    });

    document.getElementById('reverb-enabled').addEventListener('change', (e) => {
        currentPreset.reverb.enabled = e.target.checked;
        updateSectionState('reverb-section', e.target.checked);
    });
}

function updateSectionState(sectionClass, enabled) {
    const section = document.querySelector(`.${sectionClass}`);
    if (section) {
        section.classList.toggle('disabled', !enabled);
    }
}

function initSelectors() {
    document.getElementById('amp-model').addEventListener('change', (e) => {
        currentPreset.amp.model = parseInt(e.target.value);
    });

    document.getElementById('mod-type').addEventListener('change', (e) => {
        currentPreset.mod.type = parseInt(e.target.value);
    });

    document.getElementById('delay-type').addEventListener('change', (e) => {
        currentPreset.delay.type = parseInt(e.target.value);
    });

    document.getElementById('reverb-type').addEventListener('change', (e) => {
        currentPreset.reverb.type = parseInt(e.target.value);
    });

    document.getElementById('ir-cab').addEventListener('change', (e) => {
        currentPreset.irCab = parseInt(e.target.value);
    });
}

function initColorPicker() {
    const colorPicker = document.getElementById('led-color');
    const ledIndicator = document.getElementById('led-indicator');

    colorPicker.addEventListener('input', (e) => {
        const hex = e.target.value;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        currentPreset.color = [r, g, b];

        ledIndicator.style.backgroundColor = hex;
        ledIndicator.style.boxShadow = `0 0 10px ${hex}, 0 0 20px ${hex}, inset 0 -2px 4px rgba(0, 0, 0, 0.3)`;
    });
}

// ==================== FILE OPERATIONS ====================

function initFileInput() {
    document.getElementById('file-input').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const ext = file.name.split('.').pop().toLowerCase();

        if (ext === 'tkg') {
            await loadTKG(file);
        } else if (ext === 'yaml' || ext === 'yml') {
            await loadYAML(file);
        }

        // Reset input
        e.target.value = '';
    });
}

async function loadTKG(file) {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    if (bytes.length !== PRESET_SIZE) {
        alert(`Invalid TKG file: expected ${PRESET_SIZE} bytes, got ${bytes.length}`);
        return;
    }

    parseTKG(bytes);
    updateUI();
}

async function loadYAML(file) {
    const text = await file.text();
    try {
        // Simple YAML parser for our format
        const preset = parseSimpleYAML(text);
        applyYAMLPreset(preset);
        updateUI();
    } catch (e) {
        alert('Error parsing YAML: ' + e.message);
    }
}

// ==================== TKG PARSER ====================

function parseTKG(bytes) {
    // Bytes 0-3: effect enables
    currentPreset.amp.enabled = bytes[0] === 1;
    currentPreset.mod.enabled = bytes[1] === 1;
    currentPreset.delay.enabled = bytes[2] === 1;
    currentPreset.reverb.enabled = bytes[3] === 1;

    // Byte 4: noise gate
    currentPreset.noiseGate = bytes[4];

    // Byte 5: amp model
    currentPreset.amp.model = bytes[5];

    // Bytes 6-10: amp parameters
    currentPreset.amp.gain = bytes[6];
    currentPreset.amp.treble = bytes[7];
    currentPreset.amp.middle = bytes[8];
    currentPreset.amp.bass = bytes[9];
    currentPreset.amp.volume = bytes[10];

    // Byte 11: mod (encoded type + depth)
    const [modType, modDepth] = decodeEncodedParam(bytes[11]);
    currentPreset.mod.type = modType;
    currentPreset.mod.depth = modDepth;

    // Byte 12: mod speed
    currentPreset.mod.speed = bytes[12];

    // Byte 13: delay (encoded type + mix)
    const [delayType, delayMix] = decodeEncodedParam(bytes[13], 41, 87);
    currentPreset.delay.type = delayType;
    currentPreset.delay.mix = delayMix;

    // Byte 14: delay time
    currentPreset.delay.time = bytes[14];

    // Byte 15: reverb (encoded type + decay)
    const [reverbType, reverbDecay] = decodeEncodedParam(bytes[15], 42, 86);
    currentPreset.reverb.type = reverbType;
    currentPreset.reverb.decay = reverbDecay;

    // Byte 16: reverb mix
    currentPreset.reverb.mix = bytes[16];

    // Byte 17: IR cab
    currentPreset.irCab = bytes[17];

    // Bytes 18-20: color RGB
    currentPreset.color = [bytes[18], bytes[19], bytes[20]];
}

function decodeEncodedParam(raw, type2Base = 41, type3Base = 87) {
    if (raw < type2Base) {
        return [1, raw + 1];
    } else if (raw < type3Base) {
        return [2, raw - type2Base + 1];
    } else {
        return [3, raw - type3Base + 1];
    }
}

function encodeEncodedParam(type, value, type2Base = 41, type3Base = 87) {
    if (type === 1) {
        return Math.max(0, value - 1);
    } else if (type === 2) {
        return type2Base + Math.max(0, value - 1);
    } else {
        return type3Base + Math.max(0, value - 1);
    }
}

// ==================== TKG WRITER ====================

function writeTKG() {
    const bytes = new Uint8Array(PRESET_SIZE);

    // Bytes 0-3: effect enables
    bytes[0] = currentPreset.amp.enabled ? 1 : 0;
    bytes[1] = currentPreset.mod.enabled ? 1 : 0;
    bytes[2] = currentPreset.delay.enabled ? 1 : 0;
    bytes[3] = currentPreset.reverb.enabled ? 1 : 0;

    // Byte 4: noise gate
    bytes[4] = currentPreset.noiseGate;

    // Byte 5: amp model
    bytes[5] = currentPreset.amp.model;

    // Bytes 6-10: amp parameters
    bytes[6] = currentPreset.amp.gain;
    bytes[7] = currentPreset.amp.treble;
    bytes[8] = currentPreset.amp.middle;
    bytes[9] = currentPreset.amp.bass;
    bytes[10] = currentPreset.amp.volume;

    // Byte 11: mod (encoded)
    bytes[11] = encodeEncodedParam(currentPreset.mod.type, currentPreset.mod.depth);

    // Byte 12: mod speed
    bytes[12] = currentPreset.mod.speed;

    // Byte 13: delay (encoded)
    bytes[13] = encodeEncodedParam(currentPreset.delay.type, currentPreset.delay.mix, 41, 87);

    // Byte 14: delay time
    bytes[14] = currentPreset.delay.time;

    // Byte 15: reverb (encoded)
    bytes[15] = encodeEncodedParam(currentPreset.reverb.type, currentPreset.reverb.decay, 42, 86);

    // Byte 16: reverb mix
    bytes[16] = currentPreset.reverb.mix;

    // Byte 17: IR cab
    bytes[17] = currentPreset.irCab;

    // Bytes 18-20: color RGB
    bytes[18] = currentPreset.color[0];
    bytes[19] = currentPreset.color[1];
    bytes[20] = currentPreset.color[2];

    return bytes;
}

// ==================== YAML OPERATIONS ====================

function parseSimpleYAML(text) {
    const lines = text.split('\n');
    const result = {};
    let currentSection = null;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        // Check for section header
        const sectionMatch = line.match(/^(\w+):$/);
        if (sectionMatch) {
            currentSection = sectionMatch[1];
            result[currentSection] = {};
            continue;
        }

        // Check for key-value
        const kvMatch = line.match(/^\s*(\w+):\s*(.+)$/);
        if (kvMatch) {
            const [, key, value] = kvMatch;
            let parsedValue = value.trim();

            // Parse booleans
            if (parsedValue === 'true') parsedValue = true;
            else if (parsedValue === 'false') parsedValue = false;
            // Parse numbers
            else if (/^-?\d+$/.test(parsedValue)) parsedValue = parseInt(parsedValue);
            // Parse arrays [a, b, c]
            else if (parsedValue.startsWith('[') && parsedValue.endsWith(']')) {
                parsedValue = parsedValue.slice(1, -1).split(',').map(s => parseInt(s.trim()));
            }

            if (currentSection && result[currentSection]) {
                result[currentSection][key] = parsedValue;
            } else {
                result[key] = parsedValue;
            }
        }

        // Handle YAML array format
        const arrayMatch = line.match(/^-\s*(\d+)$/);
        if (arrayMatch && currentSection === 'color') {
            if (!Array.isArray(result.color)) result.color = [];
            result.color.push(parseInt(arrayMatch[1]));
        }
    }

    return result;
}

function applyYAMLPreset(yaml) {
    if (yaml.amp) {
        currentPreset.amp.enabled = yaml.amp.enabled ?? true;
        if (yaml.amp.model_id !== undefined) {
            currentPreset.amp.model = yaml.amp.model_id;
        } else if (yaml.amp.model) {
            const modelId = Object.entries(AMP_MODELS).find(([k, v]) => v === yaml.amp.model);
            currentPreset.amp.model = modelId ? parseInt(modelId[0]) : 0;
        }
        currentPreset.amp.gain = yaml.amp.gain ?? 61;
        currentPreset.amp.treble = yaml.amp.treble ?? 126;
        currentPreset.amp.middle = yaml.amp.middle ?? 114;
        currentPreset.amp.bass = yaml.amp.bass ?? 94;
        currentPreset.amp.volume = yaml.amp.volume ?? 60;
    }

    if (yaml.mod) {
        currentPreset.mod.enabled = yaml.mod.enabled ?? false;
        const modTypeId = Object.entries(MOD_TYPES).find(([k, v]) => v === yaml.mod.type);
        currentPreset.mod.type = modTypeId ? parseInt(modTypeId[0]) : 1;
        currentPreset.mod.depth = yaml.mod.depth ?? 1;
        currentPreset.mod.speed = yaml.mod.speed ?? 1;
    }

    if (yaml.delay) {
        currentPreset.delay.enabled = yaml.delay.enabled ?? false;
        const delayTypeId = Object.entries(DELAY_TYPES).find(([k, v]) => v === yaml.delay.type);
        currentPreset.delay.type = delayTypeId ? parseInt(delayTypeId[0]) : 1;
        currentPreset.delay.mix = yaml.delay.mix ?? 1;
        currentPreset.delay.time = yaml.delay.time ?? 1;
    }

    if (yaml.reverb) {
        currentPreset.reverb.enabled = yaml.reverb.enabled ?? false;
        const reverbTypeId = Object.entries(REVERB_TYPES).find(([k, v]) => v === yaml.reverb.type);
        currentPreset.reverb.type = reverbTypeId ? parseInt(reverbTypeId[0]) : 1;
        currentPreset.reverb.decay = yaml.reverb.decay ?? 1;
        currentPreset.reverb.mix = yaml.reverb.mix ?? 90;
    }

    currentPreset.noiseGate = yaml.noise_gate ?? 0;
    currentPreset.irCab = yaml.ir_cab ?? 0;

    if (yaml.color) {
        currentPreset.color = Array.isArray(yaml.color) ? yaml.color : [0xFE, 0xFE, 0x7E];
    }
}

function generateYAML() {
    const amp = currentPreset.amp;
    const mod = currentPreset.mod;
    const delay = currentPreset.delay;
    const reverb = currentPreset.reverb;

    return `amp:
  enabled: ${amp.enabled}
  model: ${AMP_MODELS[amp.model]}
  model_id: ${amp.model}
  gain: ${amp.gain}
  treble: ${amp.treble}
  middle: ${amp.middle}
  bass: ${amp.bass}
  volume: ${amp.volume}
mod:
  enabled: ${mod.enabled}
  type: ${MOD_TYPES[mod.type]}
  depth: ${mod.depth}
  speed: ${mod.speed}
delay:
  enabled: ${delay.enabled}
  type: ${DELAY_TYPES[delay.type]}
  mix: ${delay.mix}
  time: ${delay.time}
reverb:
  enabled: ${reverb.enabled}
  type: ${REVERB_TYPES[reverb.type]}
  decay: ${reverb.decay}
  mix: ${reverb.mix}
noise_gate: ${currentPreset.noiseGate}
ir_cab: ${currentPreset.irCab}
color: [${currentPreset.color.join(', ')}]
`;
}

// ==================== EXPORT FUNCTIONS ====================

function exportYAML() {
    const yaml = generateYAML();
    downloadFile(yaml, 'preset.yaml', 'text/yaml');
}

function exportTKG() {
    const bytes = writeTKG();
    const blob = new Blob([bytes], { type: 'application/octet-stream' });
    downloadFile(blob, 'preset.tkg', 'application/octet-stream');
}

function downloadFile(content, filename, mimeType) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ==================== UI UPDATE ====================

function updateUI() {
    // Toggles
    document.getElementById('amp-enabled').checked = currentPreset.amp.enabled;
    document.getElementById('mod-enabled').checked = currentPreset.mod.enabled;
    document.getElementById('delay-enabled').checked = currentPreset.delay.enabled;
    document.getElementById('reverb-enabled').checked = currentPreset.reverb.enabled;

    // Section states
    updateSectionState('amp-section', currentPreset.amp.enabled);
    updateSectionState('mod-section', currentPreset.mod.enabled);
    updateSectionState('delay-section', currentPreset.delay.enabled);
    updateSectionState('reverb-section', currentPreset.reverb.enabled);

    // Selectors
    document.getElementById('amp-model').value = currentPreset.amp.model;
    document.getElementById('mod-type').value = currentPreset.mod.type;
    document.getElementById('delay-type').value = currentPreset.delay.type;
    document.getElementById('reverb-type').value = currentPreset.reverb.type;
    document.getElementById('ir-cab').value = currentPreset.irCab;

    // Update all knobs
    document.querySelectorAll('.knob').forEach(knob => {
        const param = knob.dataset.param;
        const min = parseInt(knob.dataset.min) || 0;
        const max = parseInt(knob.dataset.max) || 127;
        const value = getParamValue(param);
        updateKnobDisplay(knob, value, min, max);
    });

    // Color
    const [r, g, b] = currentPreset.color;
    const hex = '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
    document.getElementById('led-color').value = hex;
    const ledIndicator = document.getElementById('led-indicator');
    ledIndicator.style.backgroundColor = hex;
    ledIndicator.style.boxShadow = `0 0 10px ${hex}, 0 0 20px ${hex}, inset 0 -2px 4px rgba(0, 0, 0, 0.3)`;
}
