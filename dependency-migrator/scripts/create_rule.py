#!/usr/bin/env python3
"""Create a new rule directory with template pattern.md and solution.md."""

import sys
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
RULES_DIR = SKILL_DIR / "rules"
TEMPLATE_DIR = SKILL_DIR / "scripts" / "templates"


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python create_rule.py <rule-name>", file=sys.stderr)
        print("Example: python create_rule.py uikit-button", file=sys.stderr)
        sys.exit(1)

    rule_name = sys.argv[1]
    rule_dir = RULES_DIR / rule_name

    if rule_dir.exists():
        print(f"Error: Rule directory already exists: {rule_dir}", file=sys.stderr)
        print("Remove it first if you want to recreate, or use a different name.", file=sys.stderr)
        sys.exit(1)

    rule_dir.mkdir(parents=True, exist_ok=True)

    pattern_template = TEMPLATE_DIR / "pattern-template.md"
    solution_template = TEMPLATE_DIR / "solution-template.md"

    pattern_file = rule_dir / "pattern.md"
    solution_file = rule_dir / "solution.md"

    if pattern_template.is_file():
        content = pattern_template.read_text(encoding="utf-8").replace("[Rule Name]", rule_name)
        pattern_file.write_text(content, encoding="utf-8")
        print(f"Created: {pattern_file}")
    else:
        pattern_file.write_text(f"# {rule_name}\n\n## Match Conditions\n", encoding="utf-8")
        print(f"Created: {pattern_file} (minimal template)")

    if solution_template.is_file():
        content = solution_template.read_text(encoding="utf-8").replace("[Rule Name]", rule_name)
        solution_file.write_text(content, encoding="utf-8")
        print(f"Created: {solution_file}")
    else:
        solution_file.write_text(f"# {rule_name} - Replacement Solution\n\n## Replacement Steps\n", encoding="utf-8")
        print(f"Created: {solution_file} (minimal template)")

    print()
    print(f"Rule '{rule_name}' created. Edit the following files:")
    print(f"  - {pattern_file}")
    print(f"  - {solution_file}")
    print("Optionally add an 'examples/' subdirectory with code reference files.")


if __name__ == "__main__":
    main()
