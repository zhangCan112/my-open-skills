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
description: Use when auditing the relocation of {{ADAPTER}} from host {{HOST_A}} to
  host {{HOST_B}} ({{SCOPE}}) for behavior loss or contract violations. Triggers on
  {{TRIGGER_PHRASES}}. Do NOT use for generic code review or other migration types.
---

# {{ADAPTER}} re-host review ({{HOST_A}} → {{HOST_B}})

## Scope
- In scope: {{SCOPE_DETAIL}}
- Out of scope: {{OUT_OF_SCOPE}}

## Method
Follow `references/methodology.md` — the six-piece process under the dual oracle.

## Scene-specific sweep
Migration type: adapter relocation / re-host. Partition `adapter core` vs `host glue`
first, dual oracle — core audited for behaviour vs the legacy core (acquisition seams
tagged `RE-POINTED` and verified; byte-identical only in the zero-coupling special case,
proved by a byte-oracle), glue audited against host B's contract (divergence from A =
`INTENDED`, missing B touchpoint = MISSING vs B; sweep legacy-A residue). See the
dual-oracle variant in `references/methodology.md` for the per-piece mapping.
Also sweep non-code artifacts if the scene holds logic outside code
(DB triggers/procs, batch jobs, config defaults, message schemas) — tag them
`kind: DB|batch|config|schema`.

## Verification
Evidence available: {{EVIDENCE}} → reachable tier {{REACHABLE_TIER}}.
Tier 2+ golden inputs: {{GOLDEN_INPUTS}}; Tier 4 reconciliation: {{RECONCILIATION_CHECKS}}.
Unverifiable rules are `NotVerified`, never defaulted to `Equivalent`.

## Report
Produce the Behavioral Equivalence Report (`assets/report-template.md`). Rule status
is the five-way contract: Equivalent / Improved / Different / Missing / NotVerified.
It is not final until a domain expert signs it (HITL gate). If `missing + different`
exceeds ~20%, conclude **rewrite, not migration**.
```

## references/checklist.md (write from the grounded scene)

Minimum content, each row scannable per run:

- diff surface: the module/path pairs to compare, per partition zone
- A6 rows: partition zones, `RE-POINTED` seam list, B touchpoints, legacy-A residue sweep
- risky core logic and which verification tier must cover it
- consumer contracts that must not change (error codes, response fields, ordering)