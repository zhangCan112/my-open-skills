# Rule-block template — to append a migration-review rule to an existing skill

Use this when the user wants to extend an **existing** skill with a migration-review check/rule section, not a new standalone skill. Compose the block from the grounded scene; keep it self-contained so the hosting skill needs no other changes.

## What to write

```markdown
## Migration-review rule ({{SOURCE}} → {{TARGET}})

Triggers: {{TRIGGERS}} (add as a bullet in the hosting skill's "when to use").

**Rule:** when these before/after code pairs are in scope, audit behaviour
preservation before signing off. Diff alone cannot see deleted behaviour;
{{RISKIEST_LOGIC}} is the risk hotspot.

Checklist (from the migration type, condensed):
- [ ] {{TYPE_SPECIFIC_ROWS}}        # e.g. cross-language: numeric overflow/rounding, unicode, timezone; library→vendor: error codes, data shape; adapter relocation: core behavior vs legacy (acquisition seams re-pointed to B allowed) + glue vs host B's rules + no legacy-A residue
- [ ] hidden behaviours: defaults, ordering, timing, logging, error surface, invariants, non-code (DB/batch/config)
- [ ] report status vocabulary: Equivalent / Improved / Different / Missing / NotVerified
- [ ] verification tier reached: {{REACHABLE_TIER}} (based on {{EVIDENCE}})
- For an **adapter relocation** the glue is verified against the new host's contract (B), NOT against the legacy host's glue (A): a glue that diverges from A while conforming to B is the intended outcome, not a `DIFFERS` regression. The **core** is verified for behaviour vs the legacy core (full methodology; acquisition seams legitimately re-pointed to B; byte-identical only as the zero-coupling special case).

**Gate:** a human (domain user) signs off on the report before the legacy side is retired.
```

## Rules for composing

- Keep it to the block; do not rewrite the hosting skill.
- Write the trigger phrase in the language the skill's readers use.
- Reference methodology externally if the hosting skill already has it, otherwise state `MISSING/PARTIAL/DIFFERS` classification inline (self-contained).
- Mark `{{PLACEHOLDER}}` filled; none left unfilled except a documented example.

## Concrete example (illustrative)

```markdown
## Migration-review rule (PHP → Go payments)

Triggers: reviewing `checkout` rewrite, before/after `PaymentService`.

**Rule:** audit the payment path for behaviour preservation — reject, refund,
balance invariants — before sign-off.

Checklist:
- [ ] currency precision & float rounding parity in both environments (money as long/money-decimal)
- [ ] each branch of `calculateFee()` classified MISSING / PARTIAL / DIFFERS against legacy
- [ ] event emission order on the failure path
- [ ] verification: golden master on 3 fee profiles (tier 2) — needs fixtures

**Gate:** domain expert signs the equivalence report; legacy `calculateFee` not
deleted before that.
```