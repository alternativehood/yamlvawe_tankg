"""Core converter logic for M-VAVE Tank G v2 presets."""

from dataclasses import dataclass
from pathlib import Path
from typing import Tuple
import yaml


PRESET_SIZE = 21

AMP_MODELS = {
    0: "Clean", 1: "Crunch", 2: "Hi-Gain", 3: "Metal", 4: "Acoustic",
    5: "Bass", 6: "British", 7: "American", 8: "Boutique"
}
AMP_MODELS_REV = {v: k for k, v in AMP_MODELS.items()}

MOD_TYPES = {1: "Chorus", 2: "Phaser", 3: "Tremolo"}
MOD_TYPES_REV = {v: k for k, v in MOD_TYPES.items()}

DELAY_TYPES = {1: "Digital", 2: "Analog", 3: "Tape"}
DELAY_TYPES_REV = {v: k for k, v in DELAY_TYPES.items()}

REVERB_TYPES = {1: "Room", 2: "Hall", 3: "Plate"}
REVERB_TYPES_REV = {v: k for k, v in REVERB_TYPES.items()}


def decode_encoded_param(raw: int, type1_max: int = 40, type2_base: int = 41, type3_base: int = 87) -> Tuple[int, int]:
    """Decode an encoded parameter byte into (type, value)."""
    if raw < type2_base:
        return (1, raw + 1)
    elif raw < type3_base:
        return (2, raw - type2_base + 1)
    else:
        return (3, raw - type3_base + 1)


def encode_encoded_param(effect_type: int, value: int, type2_base: int = 41, type3_base: int = 87) -> int:
    """Encode (type, value) into a single byte."""
    if effect_type == 1:
        return max(0, value - 1)
    elif effect_type == 2:
        return type2_base + max(0, value - 1)
    elif effect_type == 3:
        return type3_base + max(0, value - 1)
    else:
        raise ValueError(f"Invalid effect type: {effect_type}")


@dataclass
class Preset:
    """M-VAVE Tank G v2 preset data model."""

    # Effect toggles
    amp_on: bool = False
    mod_on: bool = False
    delay_on: bool = False
    reverb_on: bool = False

    # Noise gate
    noise_gate: int = 0

    # Amp settings
    amp_model: str = "Acoustic"
    amp_gain: int = 61
    amp_treble: int = 126
    amp_middle: int = 114
    amp_bass: int = 94
    amp_volume: int = 60

    # Modulation
    mod_type: str = "Chorus"
    mod_depth: int = 1
    mod_speed: int = 1

    # Delay
    delay_type: str = "Digital"
    delay_mix: int = 1
    delay_time: int = 1

    # Reverb
    reverb_type: str = "Hall"
    reverb_decay: int = 1
    reverb_mix: int = 90

    # IR Cabinet
    ir_cab: int = 0

    # LED color (RGB)
    color_r: int = 0xFE
    color_g: int = 0xFE
    color_b: int = 0x7E

    def validate(self) -> None:
        """Validate all parameter ranges."""
        if self.noise_gate < 0 or self.noise_gate > 127:
            raise ValueError(f"noise_gate must be 0-127, got {self.noise_gate}")
        if self.amp_model not in AMP_MODELS_REV:
            raise ValueError(f"Invalid amp_model: {self.amp_model}")
        if self.ir_cab < 0 or self.ir_cab > 8:
            raise ValueError(f"ir_cab must be 0-8, got {self.ir_cab}")

        for name in ["amp_gain", "amp_treble", "amp_middle", "amp_bass", "mod_speed", "delay_time", "reverb_mix"]:
            val = getattr(self, name)
            if val < 1 or val > 128:
                raise ValueError(f"{name} must be 1-128, got {val}")

        if self.amp_volume < 0 or self.amp_volume > 127:
            raise ValueError(f"amp_volume must be 0-127, got {self.amp_volume}")

        if self.mod_type not in MOD_TYPES_REV:
            raise ValueError(f"Invalid mod_type: {self.mod_type}")
        if self.delay_type not in DELAY_TYPES_REV:
            raise ValueError(f"Invalid delay_type: {self.delay_type}")
        if self.reverb_type not in REVERB_TYPES_REV:
            raise ValueError(f"Invalid reverb_type: {self.reverb_type}")

        for name in ["mod_depth", "delay_mix", "reverb_decay"]:
            val = getattr(self, name)
            if val < 1 or val > 46:
                raise ValueError(f"{name} must be 1-46, got {val}")

        for name in ["color_r", "color_g", "color_b"]:
            val = getattr(self, name)
            if val < 0 or val > 255:
                raise ValueError(f"{name} must be 0-255, got {val}")


def parse_tkg(data: bytes) -> Preset:
    """Parse a .tkg binary preset file into a Preset object."""
    if len(data) != PRESET_SIZE:
        raise ValueError(f"Invalid preset size: {len(data)}, expected {PRESET_SIZE}")

    mod_type, mod_depth = decode_encoded_param(data[11])
    delay_type, delay_mix = decode_encoded_param(data[13], type2_base=42, type3_base=87)
    reverb_type, reverb_decay = decode_encoded_param(data[15], type2_base=43, type3_base=86)

    return Preset(
        amp_on=bool(data[0]),
        mod_on=bool(data[1]),
        delay_on=bool(data[2]),
        reverb_on=bool(data[3]),
        noise_gate=data[4],
        amp_model=AMP_MODELS.get(data[5], "Acoustic"),
        amp_gain=data[6] + 1,
        amp_treble=data[7] + 1,
        amp_middle=data[8] + 1,
        amp_bass=data[9] + 1,
        amp_volume=data[10],
        mod_type=MOD_TYPES.get(mod_type, "Chorus"),
        mod_depth=mod_depth,
        mod_speed=data[12] + 1,
        delay_type=DELAY_TYPES.get(delay_type, "Digital"),
        delay_mix=delay_mix,
        delay_time=data[14] + 1,
        reverb_type=REVERB_TYPES.get(reverb_type, "Room"),
        reverb_decay=reverb_decay,
        reverb_mix=data[16] + 1,
        ir_cab=data[17],
        color_r=data[18],
        color_g=data[19],
        color_b=data[20],
    )


def write_tkg(preset: Preset) -> bytes:
    """Serialize a Preset object to .tkg binary format."""
    preset.validate()

    mod_fx = encode_encoded_param(MOD_TYPES_REV[preset.mod_type], preset.mod_depth)
    delay_mix_raw = encode_encoded_param(DELAY_TYPES_REV[preset.delay_type], preset.delay_mix, type2_base=42, type3_base=87)
    reverb_decay_raw = encode_encoded_param(REVERB_TYPES_REV[preset.reverb_type], preset.reverb_decay, type2_base=43, type3_base=86)

    return bytes([
        1 if preset.amp_on else 0,
        1 if preset.mod_on else 0,
        1 if preset.delay_on else 0,
        1 if preset.reverb_on else 0,
        preset.noise_gate,
        AMP_MODELS_REV[preset.amp_model],
        preset.amp_gain - 1,
        preset.amp_treble - 1,
        preset.amp_middle - 1,
        preset.amp_bass - 1,
        preset.amp_volume,
        mod_fx,
        preset.mod_speed - 1,
        delay_mix_raw,
        preset.delay_time - 1,
        reverb_decay_raw,
        preset.reverb_mix - 1,
        preset.ir_cab,
        preset.color_r,
        preset.color_g,
        preset.color_b,
    ])


def preset_to_yaml(preset: Preset) -> str:
    """Convert a Preset to YAML string."""
    data = {
        "amp": {
            "enabled": preset.amp_on,
            "model": preset.amp_model,
            "model_id": AMP_MODELS_REV[preset.amp_model],
            "gain": preset.amp_gain,
            "treble": preset.amp_treble,
            "middle": preset.amp_middle,
            "bass": preset.amp_bass,
            "volume": preset.amp_volume,
        },
        "mod": {
            "enabled": preset.mod_on,
            "type": preset.mod_type,
            "depth": preset.mod_depth,
            "speed": preset.mod_speed,
        },
        "delay": {
            "enabled": preset.delay_on,
            "type": preset.delay_type,
            "mix": preset.delay_mix,
            "time": preset.delay_time,
        },
        "reverb": {
            "enabled": preset.reverb_on,
            "type": preset.reverb_type,
            "decay": preset.reverb_decay,
            "mix": preset.reverb_mix,
        },
        "noise_gate": preset.noise_gate,
        "ir_cab": preset.ir_cab,
        "color": [preset.color_r, preset.color_g, preset.color_b],
    }
    return yaml.dump(data, default_flow_style=False, sort_keys=False)


def yaml_to_preset(yaml_str: str) -> Preset:
    """Parse a YAML string into a Preset object."""
    data = yaml.safe_load(yaml_str)

    amp = data.get("amp", {})
    mod = data.get("mod", {})
    delay = data.get("delay", {})
    reverb = data.get("reverb", {})
    color = data.get("color", [0xFE, 0xFE, 0x7E])

    # model_id takes precedence over model name
    if "model_id" in amp:
        amp_model = AMP_MODELS.get(amp["model_id"], "Acoustic")
    else:
        amp_model = amp.get("model", "Acoustic")

    return Preset(
        amp_on=amp.get("enabled", False),
        amp_model=amp_model,
        amp_gain=amp.get("gain", 61),
        amp_treble=amp.get("treble", 126),
        amp_middle=amp.get("middle", 114),
        amp_bass=amp.get("bass", 94),
        amp_volume=amp.get("volume", 60),
        mod_on=mod.get("enabled", False),
        mod_type=mod.get("type", "Chorus"),
        mod_depth=mod.get("depth", 1),
        mod_speed=mod.get("speed", 1),
        delay_on=delay.get("enabled", False),
        delay_type=delay.get("type", "Digital"),
        delay_mix=delay.get("mix", 1),
        delay_time=delay.get("time", 1),
        reverb_on=reverb.get("enabled", False),
        reverb_type=reverb.get("type", "Room"),
        reverb_decay=reverb.get("decay", 1),
        reverb_mix=reverb.get("mix", 90),
        noise_gate=data.get("noise_gate", 0),
        ir_cab=data.get("ir_cab", 0),
        color_r=color[0] if len(color) > 0 else 0xFE,
        color_g=color[1] if len(color) > 1 else 0xFE,
        color_b=color[2] if len(color) > 2 else 0x7E,
    )


def convert_file(input_path: Path, output_path: Path) -> None:
    """Convert a preset file between formats based on extension."""
    input_ext = input_path.suffix.lower()
    output_ext = output_path.suffix.lower()

    if input_ext == ".tkg" and output_ext in (".yaml", ".yml"):
        data = input_path.read_bytes()
        preset = parse_tkg(data)
        output_path.write_text(preset_to_yaml(preset))
    elif input_ext in (".yaml", ".yml") and output_ext == ".tkg":
        yaml_str = input_path.read_text()
        preset = yaml_to_preset(yaml_str)
        output_path.write_bytes(write_tkg(preset))
    else:
        raise ValueError(f"Unsupported conversion: {input_ext} -> {output_ext}")
