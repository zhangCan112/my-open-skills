#!/usr/bin/env python3
"""Load detail.md files for specified entry path-names and output as XML.

Usage: python load_details.py <entry-name> [<entry-name> ...]
Entry names are paths relative to knowledge/ using '/' separators,
e.g. "frameworks/spring-boot conventions/naming".
"""

import sys
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
KNOWLEDGE_DIR = SKILL_DIR / "knowledge"


def main() -> None:
    if not KNOWLEDGE_DIR.is_dir():
        print(f"Error: knowledge directory not found: {KNOWLEDGE_DIR}", file=sys.stderr)
        sys.exit(1)

    if len(sys.argv) < 2:
        print(
            "Usage: python load_details.py <entry-name> [<entry-name> ...]",
            file=sys.stderr,
        )
        print(
            'Example: python load_details.py frameworks/spring conventions/naming',
            file=sys.stderr,
        )
        sys.exit(1)

    names = sys.argv[1:]
    found = 0
    results = []

    for name in names:
        detail_file = KNOWLEDGE_DIR / name / "detail.md"
        if detail_file.is_file():
            content = detail_file.read_text(encoding="utf-8")
            results.append((name, content))
            found += 1
        else:
            print(
                f"Error: detail.md not found for entry: {name} "
                f"(expected: {detail_file})",
                file=sys.stderr,
            )

    if found == 0:
        print('<details count="0"/>')
        print("No details loaded. Check entry names.")
    else:
        print(f'<details count="{found}">')
        print()
        for name, content in results:
            print(f'<detail name="{name}">')
            print(content.rstrip("\n"))
            print("</detail>")
            print()
        print("</details>")


if __name__ == "__main__":
    main()
