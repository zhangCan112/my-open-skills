# Smoke example — regression for the generate side

A repeatable end-to-end check that the `migration-reviewer-generate` templates and
Phase 3 self-check still produce **migration-type-specific** findings and not a
generic overview. It is the "冒烟" from `SKILL.md` Phase 3 step 2, stored so any
change to the generate side can be regression-tested.

## Run

```powershell
powershell -ExecutionPolicy Bypass -File ./run-smoke.ps1
```

Exit code: `0` = all 5 expected findings surfaced; `1` = a regression.

## What it does

1. Reads the fixture pair `fixtures/legacy/calculate_fee.py` → `fixtures/svc/payments/fee.go`
   (a cross-language rewrite, so the checklist is stress-tested for type-driven rows).
2. Reproduces the classification a generated checklist must surface: it checks that
   each of the five expected findings (see `expected-findings.md`) is still detectable
   from the generated artifact's shape.
3. Fails loudly if any finding is lost — e.g. after someone edits the templates to a
   generic six-item list.

## Structure

```
smoke-example/
  run-smoke.ps1            # deterministic regression driver (exit 0/1)
  expected-findings.md     # the 5 findings the fixtures must surface
  fixtures/
    legacy/calculate_fee.py     # before side (Decimal, apply_coupon, audit text)
    svc/payments/fee.go         # after side (float64 rewrite with subtle drops)
```

## When to run

- After editing `assets/skill-template.md`, `references/methodology.md`, or
  `references/self-check.md` in the generate side.
- When extending the fixtures to a new migration type, add a finding expectation
  here first (TDD-style), then make the templates produce it.