# Skill template — for a standalone migration-review skill

Skeleton for a generated `migration-review-<scene>/` skill. Fill the scene content from the grounded facts; cut whatever the scene doesn't need. Use `{{PLACEHOLDER}}` only as a marker the generator manually replaces.

## Layout the generated skill gets

```
migration-review-{{SCENE_SLUG}}/
  SKILL.md                       # the composed skill below
  references/methodology.md      # copy of the shared methodology
  references/checklist.md        # scene-specific checklist (write it from the scene)
  assets/report-template.md      # copy of the equivalence report template
```

Do not inline the whole methodology as prose — link to `references/methodology.md`.

## SKILL.md skeleton

```markdown
---
name: migration-review-{{SCENE_SLUG}}
description: Use when auditing a {{SOURCE}} → {{TARGET}} migration ({{SCOPE}}) for
  missing functionality or changed business logic. Triggers on {{TRIGGER_PHRASES}}.
  Do NOT use for generic code review or unrelated migrations.
---

# {{SOURCE}} → {{TARGET}} migration review

## Scope
- In scope: {{SCOPE_DETAIL}}
- Out of scope: {{OUT_OF_SCOPE}}

## Method
Follow `references/methodology.md` — the six-piece process, in order.

## Scene-specific sweep
Migration type: {{MIGRATION_TYPE}}. Add the rows this type demands
(cross-language: numeric width, float rounding, unicode, timezone, concurrency;
framework: lifecycle/hooks, DI, defaults; split: API contract, data custody, event
timing; DB→app: proc/trigger semantics, NULL/default, transactions, rounding).

## Verification
Evidence available: {{EVIDENCE}} → reachable tier {{REACHABLE_TIER}}.
Tier 2+ golden inputs: {{GOLDEN_INPUTS}}; Tier 4 reconciliation: {{RECONCILIATION_CHECKS}}.

## Report
Produce the Behavioral Equivalence Report (`assets/report-template.md`). It is not
final until a domain expert signs it (HITL gate).
```

## references/checklist.md (write from the grounded scene)

Minimum content, each row scannable per run:

- diff surface: the module/path pairs to compare
- migration-type categories: the rows above that matter for THIS scene
- risky logic and which verification tier must cover it
- consumer contracts that must not change (error codes, response fields, ordering)