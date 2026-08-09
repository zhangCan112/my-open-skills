# Self-check — DoD for a generated migration-review artifact (Phase 3)

Run every line against the produced artifact (skill, rule block, topic, or checklist). Fix findings before delivery. Skipping a line is a skip of discipline.

## Scene grounding

- [ ] Source → target, scope, and evidence type are confirmed — not invented. If inferred, they were explicitly re-stated to the user.
- [ ] The migration type is identified (cross-language / framework / split / DB→app / vendor / adapter relocation), or explicitly marked unknown and asked.
- [ ] The artifact form is chosen and appropriate to the user's request — not always "a skill".
- [ ] **Adapter relocation only**: the scene was partitioned into `adapter core` (full methodology vs legacy core; changes allowed for re-pointed host couplings; byte-identical only in the zero-coupling special case) vs `host glue` (verify against host B's rules, NOT against legacy host A's glue); a glue that diverged from A while conforming to B is never reported as `DIFFERS`.

## Artifact correctness

- [ ] If it's a standalone skill: `name` letters/numbers/hyphens only; frontmatter has only `name` + `description` (≤1024 chars total); description starts with "Use when…", lists triggers, does NOT summarize the workflow.
- [ ] Trigger words cover what the user would actually say (e.g. "Python → Go", "审查迁移遗漏") in their language.
- [ ] Scope section reflects the confirmed scene, not a generic example.
- [ ] The checklist is **migration-type specific** — it has rows that only make sense for this kind of migration (e.g. hooks/effects for React, integer width for cross-language, data custody for service split, host-B glue rules + legacy-A residue for adapter relocation). The six generic categories alone are a FAIL.
- [ ] Non-code sweep row present if the scene holds logic outside code (DB triggers/procs, batch jobs, config defaults, message schemas).
- [ ] Riskiest-logic rows carry a target verification tier that matches the user's stated evidence.
- [ ] Status vocabulary present: Equivalent / Improved / Different / Missing / NotVerified (unverifiable ≠ Equivalent).
- [ ] Drift guard present: `missing + different > ~20%` → conclude rewrite, not migration.
- [ ] HITL / human gate is present where a report is expected, phrased as an explicit rule.
- [ ] No `{{PLACEHOLDER}}` markers left unfilled (except a documented "fill me" example).
- [ ] Methodology is linked (`references/…`) not inlined as an essay.

## Smoke test (Phase 3 step 2)

- [ ] Ran the checklist against a small real before/after slice (one function / one file pair) — or a synthetic stand-in, stated as such.
- [ ] The smoke run produced at least one concrete finding (a real `MISSING/PARTIAL/DIFFERS` observation), not "looks fine".
- [ ] If the smoke produced nothing, you stopped and asked the user for the real code slice instead of signing off.

## Both (any artifact)

- [ ] No invented facts: every claim traces to code, the user, or an explicitly flagged assumption.
- [ ] No "looks fine" dead-ends — anything suspicious has an action.

## Stop-and-restart signals

- The checklist is the generic six categories with no type-specific rows → rewrite from the migration type.
- The smoke run produced zero findings → don't ship; escalate to the real code slice.
- The description summarizes the artifact's own workflow → rewrite description.
- "The scene is obvious, I'll fill it in" appeared anywhere → go back to Phase 1.