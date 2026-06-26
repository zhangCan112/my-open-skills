#!/usr/bin/env python3
"""Recursively load all trigger.md files under knowledge/ and output as XML.

Each directory that directly contains a trigger.md file is treated as a knowledge
entry. The entry name is its path relative to knowledge/ using '/' separators
(e.g. "frameworks/spring-boot"). Any path component starting with '_' is skipped.
A directory identified as an entry is not descended into further.
"""

import sys
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
KNOWLEDGE_DIR = SKILL_DIR / "knowledge"


def find_entries(root: Path):
    """Yield (entry_name, trigger_file) for every directory holding a trigger.md.

    entry_name is relative to KNOWLEDGE_DIR using '/' separators.
    Directories whose name starts with '_' are skipped at every level.
    """
    if not root.is_dir():
        return
    for child in sorted(root.iterdir()):
        if not child.is_dir():
            continue
        if child.name.startswith("_"):
            continue
        trigger = child / "trigger.md"
        if trigger.is_file():
            rel = child.relative_to(KNOWLEDGE_DIR).as_posix()
            yield (rel, trigger)
        else:
            yield from find_entries(child)


def main() -> None:
    if not KNOWLEDGE_DIR.is_dir():
        print(f"Error: knowledge directory not found: {KNOWLEDGE_DIR}", file=sys.stderr)
        sys.exit(1)

    entries = list(find_entries(KNOWLEDGE_DIR))

    if not entries:
        print('<entries count="0"/>')
        print()
        print(
            "No knowledge entries found. Add entries under knowledge/ "
            "(path components starting with _ are skipped)."
        )
        return

    print(f'<entries count="{len(entries)}">')
    print()
    for name, trigger_file in entries:
        content = trigger_file.read_text(encoding="utf-8")
        print(f'<entry name="{name}">')
        print(content.rstrip("\n"))
        print("</entry>")
        print()
    print("</entries>")


if __name__ == "__main__":
    main()
