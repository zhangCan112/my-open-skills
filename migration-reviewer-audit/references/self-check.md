# Self-check — DoD for an audit report (Phase "report")

Run every line against the produced report before showing it as final. Fix findings first. Skipping a line skips discipline.

## Inventory & classification

- [ ] Behavior inventory **table** exists and is not summarized away — one row per behaviour, `file:line` on every row.
- [ ] Every gap carries MISSING / PARTIAL / DIFFERS **and** a severity (high/med/low) **and** a new-code ref (real path, or `not found`).
- [ ] Hidden behaviours pass (piece 4) done: defaults, ordering, timing, logging/audit, error surface, invariants — each swept over every scope line.
- [ ] Invariants checked even when rules are individually equivalent.
- [ ] No generic "looks fine" rows — anything suspicious carries an action.

## Verification & evidence

- [ ] A verification tier is **stated** (1/2/3/4), and it matches what the user's evidence actually allows.
- [ ] If Tier 2+ was impossible, it says so in the report instead of silently claiming "verified".
- [ ] Golden-master decisions: any intentional deviation upgrades the golden file only with a documented note.
- [ ] No invented facts: every claim traces to code, the user, or a flagged assumption.

## Report structure

- [ ] Sections present: summary (counts + conclusion), rule-by-rule table, behaviour differences (with intention classification), missing rules (with action), edge cases/invariants, integration points, recommendation.
- [ ] Summary has real counts, not `N`.
- [ ] Recommendations distinguishes release / fix-first / needs-domain-review.
- [ ] Human gate present: marked "pending expert sign-off", signed-line placeholders.
- [ ] No `{{PLACEHOLDER}}` left unfilled.

## Stop-and-restart

- Conclusion written before the inventory is done → do the inventory first.
- Report concluded `release` with an empty classification column → not a report.

## Verification tiers reference

| Tier | What it proves | Needs |
|---|---|---|
| 1 | static coverage looks complete | code access |
| 2 | same input → same output | runnable legacy + input corpus |
| 3 | parity under production load | production traffic |
| 4 | data lossless | new + old data stores |