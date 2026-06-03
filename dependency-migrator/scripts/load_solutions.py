#!/usr/bin/env python3
"""Load solution.md files for specified rule names and output as XML."""

import sys
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
RULES_DIR = SKILL_DIR / "rules"


def main() -> None:
    if not RULES_DIR.is_dir():
        print(f"Error: Rules directory not found: {RULES_DIR}", file=sys.stderr)
        sys.exit(1)

    if len(sys.argv) < 2:
        print("Usage: python load_solutions.py <rule-name> [<rule-name> ...]", file=sys.stderr)
        print("Example: python load_solutions.py uikit-button uikit-navigation", file=sys.stderr)
        sys.exit(1)

    rule_names = sys.argv[1:]
    found = 0
    results = []

    for name in rule_names:
        solution_file = RULES_DIR / name / "solution.md"
        if solution_file.is_file():
            content = solution_file.read_text(encoding="utf-8")
            results.append((name, content))
            found += 1
        else:
            print(f"Error: Solution not found for rule: {name} (expected: {solution_file})", file=sys.stderr)

    if found == 0:
        print('<solutions count="0"/>')
        print("No solutions loaded. Check rule names.")
    else:
        print(f'<solutions count="{found}">')
        print()
        for name, content in results:
            print(f'<solution name="{name}">')
            print(content.rstrip("\n"))
            print("</solution>")
            print()
        print("</solutions>")


if __name__ == "__main__":
    main()
