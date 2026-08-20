# Self-check — DoD for a generated migration-review artifact (Phase 3)

Run every line against the produced artifact (skill, rule block, topic, or checklist). Fix findings before delivery. Skipping a line is a skip of discipline.

## Scene grounding

- [ ] Source → target, scope, and evidence type are confirmed — not invented. If inferred, they were explicitly re-stated to the user.
- [ ] The scene is **confirmed as adapter relocation / re-host** (same adapter, host A → B, framework-facing side unchanged); if it isn't, you said so instead of forcing it.
- [ ] The artifact form is chosen and appropriate to the user's request — not always "a skill".
- [ ] The scene was partitioned into `adapter core` (full methodology vs the legacy core; acquisition seams tagged `RE-POINTED` and each verified; byte-identity claimed only in the zero-coupling special case, via a byte-oracle) vs `host glue` (oracle = host B's contract, NOT legacy A's glue; divergence from A while conforming to B is reported `INTENDED`, never `DIFFERS`).
- [ ] The partition was derived from the code (per-line host-C heuristic) and the seam list was enumerated by scanning actual imports/env/config/DI/clock/provider references — not from user memory alone.
- [ ] Host B's contract was confirmed to exist — or flagged as a prerequisite deliverable when absent.

## Artifact correctness

- [ ] If it's a standalone skill: `name` letters/numbers/hyphens only; frontmatter has only `name` + `description` (≤1024 chars total); description starts with "Use when…", lists triggers, does NOT summarize the workflow.
- [ ] Trigger words cover what the user would actually say (e.g. "Python → Go", "审查迁移遗漏") in their language.
- [ ] Scope section reflects the confirmed scene, not a generic example.
- [ ] The checklist is **A6-specific** — it has rows that only make sense for a re-host: `RE-POINTED` seam rows, `INTENDED` glue divergence, B-touchpoint MISSING, legacy-A residue. A generic behaviour checklist without them is a FAIL.
- [ ] Report rows carry an `oracle` column (`A-core` / `B-contract`); core behaviors B cannot host map preserve/translate/degrade/drop; no byte-equality claim without a byte-oracle harness.
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

- The scene turned out not to be adapter relocation → stop; don't ship an A6 checklist for another migration type.
- The checklist is the generic six categories with no A6 rows → rewrite from the partition.
- The smoke run produced zero findings → don't ship; escalate to the real code slice.
- The description summarizes the artifact's own workflow → rewrite description.
- "The scene is obvious, I'll fill it in" appeared anywhere → go back to Phase 1.