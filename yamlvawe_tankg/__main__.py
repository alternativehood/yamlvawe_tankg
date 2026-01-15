"""CLI interface for M-VAVE Tank G v2 preset converter."""

import argparse
import sys
from pathlib import Path

from .converter import convert_file


def tkg2yaml(args: argparse.Namespace) -> int:
    """Convert TKG to YAML."""
    input_path = Path(args.input)

    if args.output:
        output_path = Path(args.output)
    else:
        output_path = input_path.with_suffix(".yaml")

    try:
        convert_file(input_path, output_path)
        print(f"Converted: {input_path} -> {output_path}")
        return 0
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


def yaml2tkg(args: argparse.Namespace) -> int:
    """Convert YAML to TKG."""
    input_path = Path(args.input)

    if args.output:
        output_path = Path(args.output)
    else:
        output_path = input_path.with_suffix(".tkg")

    try:
        convert_file(input_path, output_path)
        print(f"Converted: {input_path} -> {output_path}")
        return 0
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


def main() -> int:
    parser = argparse.ArgumentParser(
        prog="yamlvawe-tankg",
        description="M-VAVE Tank G v2 preset converter"
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # tkg2yaml command
    p_tkg2yaml = subparsers.add_parser("tkg2yaml", help="Convert TKG to YAML")
    p_tkg2yaml.add_argument("input", help="Input .tkg file")
    p_tkg2yaml.add_argument("-o", "--output", help="Output .yaml file (default: same name with .yaml extension)")
    p_tkg2yaml.set_defaults(func=tkg2yaml)

    # yaml2tkg command
    p_yaml2tkg = subparsers.add_parser("yaml2tkg", help="Convert YAML to TKG")
    p_yaml2tkg.add_argument("input", help="Input .yaml file")
    p_yaml2tkg.add_argument("-o", "--output", help="Output .tkg file (default: same name with .tkg extension)")
    p_yaml2tkg.set_defaults(func=yaml2tkg)

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 0

    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
