# Smoke example — regression for the generate side

A repeatable end-to-end check that the `migration-reviewer-generate` templates and
Phase 3 self-check still produce **migration-type-specific** findings and not a
generic overview. It is the "冒烟" from `SKILL.md` Phase 3 step 2, stored so any
change to the generate side can be regression-tested.

## Run

```powershell
powershell -ExecutionPolicy Bypass -File ./run-smoke.ps1
```

Exit code: `0` = all 9 expected findings surfaced; `1` = a regression.

## What it does

1. Reads two fixture pairs:
   - `fixtures/legacy/calculate_fee.py` → `fixtures/svc/payments/fee.go`
     (cross-language rewrite, so the checklist is stress-tested for type-driven rows).
   - `fixtures/adapter/legacy/{adapter_core.py, app_a/glue_a.py}` →
     `fixtures/adapter/target/{adapter_core.py, app_b/glue_b.py}`
     (adapter relocation App A → App B, so the twin-oracle rows are stress-tested:
     portable core byte-identical, host glue conforms to B not A, legacy-A residue,
     host-B-only requirement missing).
2. Reproduces the classification a generated checklist must surface: it checks that
   every expected finding (see `expected-findings.md`) is still detectable from the
   generated artifact's shape.
3. Fails loudly if any finding is lost — e.g. after someone edits the templates to a
   generic six-item list or drops the adapter-relocation rows.

## Structure

```
smoke-example/
  run-smoke.ps1            # deterministic regression driver (exit 0/1)
  expected-findings.md     # the 9 findings the fixtures must surface
  fixtures/
    legacy/calculate_fee.py     # scene 1 before (Decimal, apply_coupon, audit text)
    svc/payments/fee.go         # scene 1 after (float64 rewrite with subtle drops)
    adapter/
      legacy/adapter_core.py    # scene 2 portable core — must stay byte-identical
      legacy/app_a/glue_a.py    # scene 2 host A glue (ATLAS: env key, "error", label)
      target/adapter_core.py    # scene 2 core as relocated (identical on purpose)
      target/app_b/glue_b.py    # scene 2 host B glue (ORB_SECTION, reason, display + A residue)
```

## When to run

- After editing `assets/skill-template.md`, `references/methodology.md`, or
  `references/self-check.md` in the generate side.
- When extending the fixtures to a new migration type, add a finding expectation
  here first (TDD-style), then make the templates produce it.