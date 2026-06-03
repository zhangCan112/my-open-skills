#!/usr/bin/env python3
"""Load all pattern.md files from rules/ subdirectories and output as XML."""

import sys
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
RULES_DIR = SKILL_DIR / "rules"


def main() -> None:
    if not RULES_DIR.is_dir():
        print(f"Error: Rules directory not found: {RULES_DIR}", file=sys.stderr)
        sys.exit(1)

    rule_dirs = sorted(
        d for d in RULES_DIR.iterdir()
        if d.is_dir() and not d.name.startswith("_")
    )

    if not rule_dirs:
        print('<patterns count="0"/>')
        print()
        print("No rules found. Add rule directories under rules/ (directories starting with _ are skipped).")
        return

    print(f'<patterns count="{len(rule_dirs)}">')
    print()
    for rule_dir in rule_dirs:
        pattern_file = rule_dir / "pattern.md"
        if pattern_file.is_file():
            content = pattern_file.read_text(encoding="utf-8")
            print(f'<rule name="{rule_dir.name}">')
            print(content.rstrip("\n"))
            print("</rule>")
            print()
    print("</patterns>")


if __name__ == "__main__":
    main()
