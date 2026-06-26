# Enterprise Knowledge

A generic Skill for querying enterprise internal code and framework knowledge. Through a user-maintained knowledge library (trigger + detail), it surfaces relevant internal knowledge — either proactively (scanning code) or reactively (answering queries) — and provides a guided authoring mode for adding new knowledge.

**This skill is domain-agnostic.** It works for any enterprise. The two workflows (Query Mode and Add Mode) are fixed; extension only requires adding entry directories under `knowledge/`.

## Directory Structure

```
enterprise-knowledge/
  SKILL.md                         # Skill workflows (AI reads this)
  README.md                        # This file (human maintainers read this)
  scripts/
    load_index.py                  # Recursively load all trigger.md, XML-wrapped output
    load_details.py                # Load detail.md by entry path-name, XML-wrapped output
    create_entry.py                # Create new entry directory from templates
    templates/
      trigger-template.md          # Suggested trigger template
      detail-template.md           # Suggested detail template
  knowledge/
    _example/                      # Example entry (skipped by load_index.py)
      trigger.md
      detail.md
      examples/
```

## Two Modes

- **Query Mode** — Recall/apply internal knowledge. Workflow: load index → identify relevance (scan code and/or match query) → load & verify details → respond.
- **Add Mode** — Record new knowledge via guided interview. Workflow: dedup-check → locate → scaffold → interview trigger → interview detail → quality-check → confirm.

See `SKILL.md` for the full workflows.

## Adding New Knowledge

Run `python scripts/create_entry.py <category>/<entry-name>` from the skill directory:

```bash
python scripts/create_entry.py frameworks/spring-boot
```

This creates:

```
knowledge/frameworks/spring-boot/
  trigger.md       <- from template
  detail.md        <- from template
```

Then either:
- Use **Add Mode** (recommended): the skill interviews you item-by-item and fills the files with concrete content.
- Or manually edit `trigger.md` (when this knowledge applies) and `detail.md` (the actual knowledge).

Optionally add an `examples/` directory with code reference files.

**No changes to SKILL.md or scripts are needed.**

## Entry Directory Structure

```
knowledge/
  _example/                      <- skipped by load_index.py
    trigger.md
    detail.md
    examples/
      correct.example
      incorrect.example
  frameworks/                    <- category (you create)
    spring-boot/                 <- entry
      trigger.md
      detail.md
      examples/                  <- optional
        ...
  conventions/                   <- another category
    naming/
      trigger.md
      detail.md
```

## Naming & Path Rules

- Entry name = directory path relative to `knowledge/`, using `/` (e.g., `frameworks/spring-boot`).
- Any path component starting with `_` is skipped by `load_index.py` (so `_example` is never indexed).
- Categories are created automatically by `create_entry.py`.

## Template Customization Checklist

When applying this skill to your enterprise:

- [ ] SKILL.md frontmatter `description` tuned to your domain's triggers
- [ ] Replace `_example/` with a real enterprise example entry
- [ ] Establish your category taxonomy under `knowledge/` (e.g., `frameworks/`, `conventions/`, `apis/`)

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Modifying SKILL.md when adding knowledge | Only add directories under knowledge/ |
| Writing detail content inline in trigger.md | Keep trigger (when it applies) and detail (the knowledge) separate |
| Naming an entry directory starting with `_` | Leading `_` means it's skipped by load_index.py |
| Vague triggers ("applies to logging") | Be specific: APIs, classes, keywords, query phrases |
