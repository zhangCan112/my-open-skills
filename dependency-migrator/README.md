# Dependency Migrator

A generic Skill template for code dependency/API migration. Through a user-maintained rule library (pattern + solution), it intelligently identifies old dependencies that need replacement in code, confirms with the user, and executes the replacement.

**This is a template.** When applying to a specific technology (e.g., iOS Swift, Android Kotlin, React), fill in the `{{PLACEHOLDER}}` markers in SKILL.md and replace `_example/` rules with real ones.

## Directory Structure

```
dependency-migrator/
  SKILL.md                         # Skill workflow (AI reads this)
  README.md                        # This file (human maintainers read this)
  scripts/
    load_patterns.py               # Load all pattern.md, XML-wrapped output
    load_solutions.py              # Load solution.md by name, XML-wrapped output
    create_rule.py                 # Create new rule directory from templates
    templates/
      pattern-template.md          # Suggested pattern template
      solution-template.md         # Suggested solution template
  rules/
    _example/                      # Example rule (skipped by load_patterns.py)
      pattern.md
      solution.md
      examples/
        before.example
        after.example
```

## Adding New Rules

Run `python3 scripts/create_rule.py <rule-name>` from the skill directory:

```bash
python3 scripts/create_rule.py my-new-rule
```

This creates:

```
rules/my-new-rule/
  pattern.md       ← from template
  solution.md      ← from template
```

Then:

1. Edit `pattern.md` — describe what code to match
2. Edit `solution.md` — describe how to replace it
3. Optionally add `examples/` directory with code reference files (e.g., `before.swift`, `after.swift`)

No changes to SKILL.md or scripts are needed.

## Rule Directory Structure

```
rules/
  _example/              ← skipped by load_patterns.py
    pattern.md
    solution.md
    examples/
      before.example
      after.example
  your-rule-name/        ← add as many as needed
    pattern.md
    solution.md
    examples/            ← optional
      ...
```

## Template Customization Checklist

When applying this template to a specific technology:

- [ ] SKILL.md frontmatter `name` and `description` with technology-specific triggers
- [ ] SKILL.md "Overview" and "When to Use" sections with technology-specific scenarios
- [ ] Replace `_example/` rules with real technology-specific example rules
- [ ] Update code file extensions in examples (e.g., `.swift`, `.kt`, `.tsx`)

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Modifying SKILL.md when adding rules | Only add directories under rules/ |
| Writing solution content inline in pattern.md | Keep pattern and solution separate |
| Naming a rule directory starting with `_` | Leading `_` means it's skipped by load_patterns.py |
