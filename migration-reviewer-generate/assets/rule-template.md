# Rule-block template — to append a migration-review rule to an existing skill

Use this when the user wants to extend an **existing** skill with a migration-review check/rule section, not a new standalone skill. Compose the block from the grounded scene; keep it self-contained so the hosting skill needs no other changes.

## What to write

```markdown
## Migration-review rule (adapter re-host {{HOST_A}} → {{HOST_B}})

Triggers: {{TRIGGERS}} (add as a bullet in the hosting skill's "when to use").

**Rule:** when this adapter's before/after relocation pairs are in scope, audit
behaviour preservation per partition before signing off. Diff alone cannot see
deleted behaviour — and in a re-host, glue that diverged from A is often correct;
{{RISKIEST_LOGIC}} is the risk hotspot.

Checklist (dual oracle, condensed):
- [ ] {{A6_ROWS}}        # e.g. core vs legacy core per branch; seams tagged `RE-POINTED`, verified; glue vs host B's contract; B-touchpoint conformance; no legacy-A residue
- [ ] hidden behaviours: defaults, ordering, timing, logging, error surface, invariants, non-code (DB/batch/config)
- [ ] report status vocabulary: Equivalent / Improved / Different / Missing / NotVerified
- [ ] verification tier reached: {{REACHABLE_TIER}} (based on {{EVIDENCE}})
- For an **adapter relocation** the glue is verified against the new host's contract (B), NOT against the legacy host's glue (A): a glue that diverges from A while conforming to B is the intended outcome (`INTENDED`), not a `DIFFERS` regression. The **core** is verified for behaviour vs the legacy core (full methodology; acquisition seams legitimately re-pointed to B and tagged `RE-POINTED`; byte-identical only as the zero-coupling special case).

**Gate:** a human (domain user) signs off on the report before the legacy side is retired.
```

## Rules for composing

- Keep it to the block; do not rewrite the hosting skill.
- Write the trigger phrase in the language the skill's readers use.
- Reference methodology externally if the hosting skill already has it, otherwise state `MISSING/PARTIAL/DIFFERS` classification inline (self-contained).
- Mark `{{PLACEHOLDER}}` filled; none left unfilled except a documented example.

## Concrete example (illustrative)

```markdown
## Migration-review rule (payment adapter: host ATLAS → host ORB)

Triggers: reviewing the payment adapter re-host from App ATLAS to App ORB,
before/after `PaymentAdapter` + glue.

**Rule:** audit the relocation across both partitions — core decisions vs the
legacy core, glue conformance vs ORB's contract — before sign-off.

Checklist:
- [ ] core: every `normalize_currency`/fee branch classified MISSING / PARTIAL / DIFFERS vs legacy core
- [ ] seams: `PROVIDER_SOURCE`, `PAYMENTS_CLOCK` re-pointed to ORB → tagged `RE-POINTED`, behavior verified (same corpus through both cores, normalized comparison)
- [ ] glue: ORB touchpoints (auth scope, `emit_metric`, error payload shape) all wired — absent = MISSING vs B
- [ ] residue: no ATLAS env keys / field names / log prefixes surviving in the ORB region

**Gate:** domain expert signs the equivalence report; App ATLAS's glue not
deleted before that.
```