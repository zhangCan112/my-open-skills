# Spec: release-test-focus Skill

## Summary

A skill for the pre-release phase of a large project: it compiles a release's two kinds of changes — main-project code changes (tickets behind PRs) and dependency-library upgrades (their tickets) — into a structured "release test brief" so testers can see at a glance what must be tested this release and where to regress.

Input is a homogeneous ticket list (`id / title / description / type (Story|Defect) / priority / source (main|dependency)`; dependency tickets carry `library / version change`). Output is a single Markdown document: Contents → §0 Overview → §1 Must-test priorities → §2 Main-project changes → §3 Dependency upgrades, linked by clickable anchors.

**Division of labor:** semantic work (reading descriptions, generating the `focus` test-focus line) is done by the LLM; mechanical work (priority mapping, must-test selection, sort, risk, rendering) is done by the script reading `rules.ini`. Rules live only in `rules.ini`.

## Architecture

```
release-test-focus/
  SKILL.md                   # Main workflow (4 steps); holds the focus-generation rules (semantic, for the LLM)
  README.md                  # Maintainer docs
  rules.ini                  # Single source for mechanical rules (read by the script)
  scripts/
    render_brief.py          # tickets.json + rules.ini -> release-test-focus.md
  examples/
    sample-tickets.json      # Sample input
```

Mirrors the "fixed SKILL.md + fixed scripts + single extension point" architecture of `dependency-migrator` / `enterprise-knowledge`. Difference: this skill's extension point is `rules.ini` (tuning judgment rules), not a knowledge/rule directory.

## Workflow (4 steps, fixed)

```
Step1 Collect input + generate focus (LLM) -> Step2 Load rules -> Step3 Render (script) -> Step4 User confirms
```

- **Step 1 — Collect input (incl. generating focus)** — Ask for release meta (version/baseline/window) + the ticket list. In the same pass, read each `description` and distill a testable focus line into `focus` (table below); assemble `tickets.json`. Focus generation is LLM semantic work the script cannot do.
- **Step 2 — Load rules** — Read `rules.ini`. Map priorities via `priority_mapping`, never from memory. An unmapped priority makes the script error and prompt you to add it.
- **Step 3 — Render (script, mechanical)** — `python scripts/render_brief.py tickets.json`, produces Markdown with a TOC and anchors.
- **Step 4 — User confirms** — Calibrate the §1 priorities table first, then render the full brief.

### Focus generation rules (type × source)

| Type | Source | Focus distillation |
|---|---|---|
| Story | main | new behavior/scenario → happy-path + error + boundary |
| Defect | main | the fix → fixed scenario + boundary conditions |
| Story | dependency | behavior change from the upgrade → regression of features that use the library |
| Defect | dependency | the library's fix → whether we are affected + regression scope |

## Input schema (tickets.json)

```json
{
  "meta": { "version": "...", "baseline": "...", "window": "..." },
  "tickets": [
    { "id": "...", "title": "...", "description": "...",
      "type": "Story|Defect", "priority": "<team's real naming>", "source": "main|dependency",
      "focus": "<LLM-generated>",
      "library": "...", "version_from": "...", "version_to": "..." }
  ]
}
```

`priority` is naming-agnostic — fill in the team's real value; `rules.ini`'s `priority_mapping` maps it to `(tier, weight)`.

## rules.ini (single source for mechanical rules)

- `priority_mapping` — real naming → `{tier, weight}`. The primary customization point.
- `must_test` — three conditions (any one sends a ticket to the must-test table):
  - A: `priority_weight_min` (weight ≥ threshold, default 70 = P0/P1)
  - B: `sources` (these sources are always must-test, default includes `dependency`, because upgrades have wide regression surface)
  - C: `description_keywords` (breaking-change keywords, e.g. breaking/incompatible/removed/deleted/deprecated)
- `type_order` / `source_order` — must-test table sort keys: hit-count → weight → type (Story>Defect) → source (main>dependency).
- `risk` — overall risk thresholds (high/medium-high/medium/low); breaking changes (condition C) and high-priority dependency upgrades trigger "medium-high".
- `nav` — TOC, anchor prefix, back-to-top toggles.

## Output (single Markdown, with navigation)

- **Contents** at the top: links to each section.
- **§0 Overview**: version / window / scope (how many Stories/Defects per source) / overall risk.
- **§1 Must-test priorities**: a table sorted per rules.ini; Ticket IDs are clickable → jump to the §2/§3 entry.
- **§2 Main-project changes**: grouped into Stories / Defects, by descending priority, with each ticket's focus.
- **§3 Dependency upgrades**: library / version change / ticket / type / priority / regression hint.
- Low-priority tickets are excluded from §1 but still appear **in full** in §2/§3.
- Anchors: `§1 → §2/§3` via `<a id="t-<id>"></a>` + `[ID](#t-<id>)`; each section ends with "↑ Back to contents".

## Design decisions

1. **Layered format (priorities overview + categorized lists)**: surfaces what matters most in medium/large releases; small releases naturally produce a short brief.
2. **Split by source**: main-project changes (test the feature/fix) and dependency upgrades (test regression) have different testing characters, so they get separate sections.
3. **Priority naming decoupled**: the team's real naming is mapped once to `(tier, weight)`; all later judgments reference weight only, so changing the naming scheme means editing only `priority_mapping`.
4. **Dependencies are must-test by default**: even low-priority upgrades have wide regression surface and need testing attention.
5. **LLM/script division of labor**: `focus` is semantic (script can't do it); everything else is mechanical, making output reproducible and rules changeable without code edits.
6. **rules.ini + configparser (standard library)**: this skill adds no third-party dependency; config is INI parsed by Python's standard `configparser` — commentable, easy to edit, pure native API. The script fails loudly on an unknown priority and prompts you to add the mapping.

## Non-goals

- Not for end-user changelogs (different purpose).
- Does not auto-fetch Jira / git (ticket data sourcing is handled upstream; this skill only specifies the input fields).
- Does not auto-generate `focus` (semantic work left to the LLM).
