# Spec: enterprise-knowledge Skill Template

## Summary

A generic Skill template for enterprise internal code & framework knowledge querying. Through a user-maintained knowledge library (trigger + detail), it surfaces relevant internal knowledge either proactively (scanning code) or reactively (answering queries), and provides a guided authoring mode for adding new knowledge. The workflows are fixed; extension only requires adding entry directories under `knowledge/`.

**This is a Skill pattern/template.** It ships with an `_example/` entry and templates. The user fills in real enterprise knowledge; the structure and scripts never need to change.

This skill mirrors the architecture of `dependency-migrator` (fixed SKILL.md + fixed scripts + single extension point), adapted from a *transform* workflow (match → replace) to a *retrieve* workflow (load → verify → answer), plus an *authoring* workflow (interview → write).

## Architecture

```
enterprise-knowledge/
  SKILL.md                         # Skill body: two fixed modes (query + add)
  README.md                        # Maintenance guide for human contributors
  scripts/
    load_index.py                  # Recursively read all trigger.md under knowledge/, XML output
    load_details.py                # Read detail.md by entry path-name, XML output
    create_entry.py                # Create new entry dir under a category, from templates
    templates/
      trigger-template.md          # Suggested trigger template
      detail-template.md           # Suggested detail template
  knowledge/
    _example/                      # Example entry (skipped by load_index.py)
      trigger.md
      detail.md
      examples/
    <category>/                    # User-created categories (frameworks/, conventions/, ...)
      <entry>/
        trigger.md
        detail.md
        examples/                  # Optional
```

## Two Fixed Modes

SKILL.md opens with a routing decision (When to Use) that selects one of two fixed workflows.

### Query Mode (4 steps, fixed)

```
Step 1: Load Index -> Step 2: Identify Relevance -> Step 3: Load & Verify -> Step 4: Respond
```

- **Step 1 Load Index** — `python scripts/load_index.py`. Returns all triggers (lightweight "when this applies" metadata). Authoritative source of what knowledge exists. Must not be skipped.
- **Step 2 Identify Relevance (hybrid)** — Use all triggers as match criteria. Two paths, both valid:
  - Proactive: scan code/context for code patterns described in triggers.
  - Reactive: match the user's question/intent against triggers.
  - Collect the path-names of hit entries (e.g., `frameworks/spring-boot`).
- **Step 3 Load & Verify** — `python scripts/load_details.py <entry-name>...`. Load detail content, cross-validate that each entry truly applies, discard false positives (avoid surfacing irrelevant knowledge). Must not be skipped.
- **Step 4 Respond** — Answer the query or proactively surface applicable knowledge (file locations, code snippets, recommendations). The knowledge skill only *presents/advises*; it does not edit code.

If no entries match in Step 2, report that clearly and stop.

### Add Mode (7 steps, item-by-item interview, fixed)

```
Step 1: Dedup-check -> Step 2: Locate -> Step 3: Scaffold -> Step 4: Interview trigger -> Step 5: Interview detail -> Step 6: Quality-check -> Step 7: Confirm
```

- **Step 1 Dedup-check** — `python scripts/load_index.py` first. Review existing triggers; if similar knowledge exists, ask whether to extend an existing entry or create new.
- **Step 2 Locate** — What is the knowledge? Which category (existing or new)?
- **Step 3 Scaffold** — `python scripts/create_entry.py <category>/<entry-name>`.
- **Step 4 Interview trigger.md** (item-by-item): applicable scenarios (specific APIs/classes/keywords), which queries hit it, exclusion conditions, confusable points.
- **Step 5 Interview detail.md** (item-by-item): overview, usage/conventions, code examples (may go under `examples/`), common pitfalls, references.
- **Step 6 Quality-check** — Is trigger specific enough (not vague)? Is detail complete? Are examples accurate? Are trigger and detail consistent?
- **Step 7 Confirm** — Show generated files; let user review/adjust.

The AI interviews then writes; the user only answers item-by-item, no manual template editing required.

## Scripts

All scripts are Python 3.11+ (pathlib, cross-platform: Windows/macOS/Linux). On Windows invoke with `python`.

### load_index.py

- **Input:** No arguments.
- **Behavior:** Recursively traverse `knowledge/`; every directory that directly contains `trigger.md` is an entry. Entry name = its path relative to `knowledge/` using `/` as separator (e.g., `frameworks/spring`). Skip any path component starting with `_`.
- **Output:** XML-wrapped merged content; each entry wrapped in `<entry name="frameworks/spring">...</entry>` inside a `<entries count="N">` root.
- **Location:** In `scripts/`; locates `knowledge/` via `Path(__file__).
- **Empty case:** Print `<entries count="0"/>` with guidance.

### load_details.py

- **Input:** One or more entry path-names as positional arguments (e.g., `frameworks/spring conventions/naming`).
- **Behavior:** Look up `knowledge/<name>/detail.md`.
- **Output:** XML-wrapped merged content, each wrapped in `<detail name="...">`.
- **Error handling:** Report missing detail to stderr; still output any found.

### create_entry.py

- **Input:** A single path-name argument like `<category>/<entry-name>` (e.g., `frameworks/spring-boot`). A bare `<entry-name>` is also allowed (top-level entry).
- **Behavior:**
  1. Create `knowledge/<path-name>/` directory (including category dirs).
  2. Generate `trigger.md` and `detail.md` from templates (replacing `[Entry Name]`).
  3. Error if the entry directory already exists; do not overwrite.
- **Output:** Print created file paths and next-step guidance.

## Templates

Templates are **suggested but not enforced**. Users may write trigger.md and detail.md in any format. The Add Mode workflow guides content regardless of template format.

### trigger-template.md

```markdown
# [Entry Name]

## Applicable Scenarios
Describe what code patterns or situations this knowledge applies to. Be specific:
- Which APIs, classes, methods, or keywords signal relevance
- Which kinds of queries/questions this entry should answer

## Match Triggers (optional)
Keywords, imports, or call patterns that indicate this entry is relevant.

## Exclusion Conditions (optional)
Describe what should NOT be matched.

## Notes (optional)
Confusable points, e.g., similar-looking APIs to distinguish from.
```

### detail-template.md

```markdown
# [Entry Name]

## Overview
One or two sentences: what is this and why does it matter.

## Usage / Conventions
The correct way to use this framework/API/convention.

## Code Examples
(Write code inline, or reference files under examples/)

## Common Pitfalls
Things that are easy to get wrong.

## References (optional)
Links, related entries, or further reading.
```

## Code File References

detail.md may reference code files within the entry directory (e.g., `examples/correct.java`). AI reads detail first, then decides whether to load referenced files on demand. Code files are optional.

## Extension Model

Adding new knowledge only requires:
1. (Recommended) Use Add Mode, which runs `python scripts/create_entry.py <category>/<name>` and guides authoring.
2. Or manually: create the directory and edit `trigger.md` + `detail.md`.
3. Optionally add an `examples/` directory with code samples.
4. No changes to SKILL.md or scripts needed.

## Naming & Path Rules

- Entry name = directory path relative to `knowledge/`, joined by `/` (e.g., `frameworks/spring-boot`).
- Any path component starting with `_` is skipped by `load_index.py` (so `_example` is never indexed).
- Category directories are created automatically by `create_entry.py`.

## Template Customization Checklist

When applying this template to your enterprise:
- [ ] SKILL.md frontmatter `description` with your domain-specific triggers.
- [ ] Replace `_example/` with real enterprise example entries.
- [ ] Establish your category taxonomy under `knowledge/` (e.g., `frameworks/`, `conventions/`, `apis/`).
