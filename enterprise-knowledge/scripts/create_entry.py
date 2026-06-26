#!/usr/bin/env python3
"""Create a new knowledge entry directory with template trigger.md and detail.md.

Usage: python create_entry.py <category>/<entry-name>
Example: python create_entry.py frameworks/spring-boot

A bare <entry-name> (top-level entry) is also allowed.
Categories are created automatically. Path components starting with '_' are
rejected. The entry directory must not already exist.
"""

import sys
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
KNOWLEDGE_DIR = SKILL_DIR / "knowledge"
TEMPLATE_DIR = SKILL_DIR / "scripts" / "templates"


def main() -> None:
    if len(sys.argv) < 2:
        print(
            "Usage: python create_entry.py <category>/<entry-name>",
            file=sys.stderr,
        )
        print(
            "Example: python create_entry.py frameworks/spring-boot",
            file=sys.stderr,
        )
        sys.exit(1)

    path_name = sys.argv[1].replace("\\", "/").strip("/")
    if not path_name:
        print("Error: entry name must not be empty", file=sys.stderr)
        sys.exit(1)

    parts = path_name.split("/")
    for part in parts:
        if part.startswith("_"):
            print(
                f"Error: path component must not start with '_': {part}",
                file=sys.stderr,
            )
            sys.exit(1)

    entry_dir = KNOWLEDGE_DIR / path_name
    if entry_dir.exists():
        print(f"Error: entry directory already exists: {entry_dir}", file=sys.stderr)
        print(
            "Remove it first if you want to recreate, or use a different name.",
            file=sys.stderr,
        )
        sys.exit(1)

    entry_dir.mkdir(parents=True, exist_ok=True)

    last_name = parts[-1]
    trigger_template = TEMPLATE_DIR / "trigger-template.md"
    detail_template = TEMPLATE_DIR / "detail-template.md"

    trigger_file = entry_dir / "trigger.md"
    detail_file = entry_dir / "detail.md"

    if trigger_template.is_file():
        content = trigger_template.read_text(encoding="utf-8").replace(
            "[Entry Name]", last_name
        )
        trigger_file.write_text(content, encoding="utf-8")
        print(f"Created: {trigger_file}")
    else:
        trigger_file.write_text(
            f"# {last_name}\n\n## Applicable Scenarios\n", encoding="utf-8"
        )
        print(f"Created: {trigger_file} (minimal template)")

    if detail_template.is_file():
        content = detail_template.read_text(encoding="utf-8").replace(
            "[Entry Name]", last_name
        )
        detail_file.write_text(content, encoding="utf-8")
        print(f"Created: {detail_file}")
    else:
        detail_file.write_text(
            f"# {last_name}\n\n## Overview\n", encoding="utf-8"
        )
        print(f"Created: {detail_file} (minimal template)")

    print()
    print(f"Entry '{path_name}' created. Edit the following files:")
    print(f"  - {trigger_file}")
    print(f"  - {detail_file}")
    print("Optionally add an 'examples/' subdirectory with code reference files.")


if __name__ == "__main__":
    main()
