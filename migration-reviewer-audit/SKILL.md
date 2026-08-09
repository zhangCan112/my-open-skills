---
name: migration-reviewer-audit
description: Use when given real before→after code (or two paths) of a migration to audit for missed functionality or silently changed business logic — a framework upgrade, language rewrite, service split, or large refactor. Produces a Behavioral Equivalence Report using the six-piece methodology, MISSING/PARTIAL/DIFFERS classification, and a human sign-off gate before legacy retirement. Triggers on "审查这次迁移", "对比迁移前后的行为", "帮我 check 迁移有没有漏业务". Do NOT use for generic code review, for writing a new migration-review checklist/skill (use migration-reviewer-generate), or for executing the migration (use dependency-migrator).
---

# Migration Reviewer — Audit

## Overview

> 审行为，不审"改动"：前后代码的 diff 看不见被删除的分支。旧行为（**包括 bug**）就是规格。

Audits a real before→after code migration for missed functionality and silent business changes. The deliverable is a **Behavioral Equivalence Report** with an explicit verification tier and a human sign-off gate.

## Iron rule

```
No report — and no "looks fine" — until every behaviour of the scope has an inventory row
and every gap is classified.
```

Enumerate behaviours **before** diffing. Classification is `MISSING / PARTIAL / DIFFERS`, each with severity. A report without an inventory table is not a report.

## Flow

1. **Scope & ground** — confirm with the user: what before/after file pairs are in scope (paths), and what evidence exists (tests, golden corpus, runnable legacy).
2. **Behavior inventory** — read all scope files; one behaviour per line, each with `file:line`: branches, guards, event handlers, derived state, error paths, i18n text, side effects.
3. **Business Rules Inventory** — "what must be preserved", per rule: ID · description · legacy location · criticality.
4. **Gap classification** — compare against target; each gap = category + severity + legacy ref + new ref.
5. **Hidden behaviours** — sweep for defaults, ordering, timing, logging/audit, error surface, invariants.
6. **Verification tier** — state which tier is actually reachable *(1 static, 2 characterization test/golden master, 3 shadow, 4 data reconciliation)*, and say where it was impossible. Unverifiable rules are `NotVerified`, never defaulted to `Equivalent`.
7. **Report + human gate** — fill `assets/report-template.md`; run `references/self-check.md` against it and fix every finding; mark pending expert sign-off. Show it to the user as the deliverable.

## Checklist

- [ ] Scope confirmed (before/after pairs, what's out).
- [ ] Behavior inventory written with `file:line`, not summarized away.
- [ ] Every gap classified <kbd>MISSING</kbd> (absent) / <kbd>PARTIAL</kbd> (incomplete) / <kbd>DIFFERS</kbd> (logic changed) + severity; report state per rule is **Equivalent / Improved / Different / Missing / NotVerified**
- [ ] Hidden behaviours pass done: defaults, ordering, timing, logging, error surface, invariants, non-code artifacts (DB constraints/triggers, batch jobs, config).
- [ ] Verification tier stated and realistic for the available evidence.
- [ ] Report contains every mandatory section (summary, rules, differences, missing, invariants, integration, recommendation).
- [ ] Report marked "pending expert sign-off" — the human gate is a rule, not an aside.

## Common mistakes

| Mistake | Fix |
|---|---|
| Diffing before inventory | Build the inventory first; diff is only a hint |
| Classifying without severity | Every row gets category + severity (high/med/low) |
| Pronouncing "looks fine" | Every suspicious row has an action, never a shrug |
| Skipping verification when evidence allows | Characterization tests > compile-pass; use tier 2+ when the evidence exists, state `none reachable` when it does not |
| An inventory that omits half a module | Inventory is exhaustive — read all files in scope |

## Danger signals — stop and restart

- Started the report without an inventory table.
- The classification column is empty.
- "Verified" but no verification (tier is not stated) — tier states impossible as `none reachable`.
- Human gate skipped with "they'll trust our diff".
- Drift ignored: `MISSING + DIFFERS > ~20%` treated as a checklist of gaps instead of being flagged as a rewrite.

## References

- `references/methodology.md` — the six pieces (authority).
- `references/self-check.md` — DoD checklist run against the report before sign-off.
- `assets/report-template.md` — Behavioral Equivalence Report template.

Producing a reusable review checklist/skill for a specific migration scene → `migration-reviewer-generate`.