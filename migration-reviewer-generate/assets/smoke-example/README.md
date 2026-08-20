# Smoke example — regression for the generate side

A repeatable end-to-end check that the `migration-reviewer-generate` templates and
Phase 3 self-check still produce **A6-specific** findings (dual-oracle classification,
not a generic overview). It is the "冒烟" from `SKILL.md` Phase 3 step 2, stored so any
change to the generate side can be regression-tested.

## Run

```powershell
powershell -ExecutionPolicy Bypass -File ./run-smoke.ps1
```

Exit code: `0` = all 5 expected findings surfaced; `1` = a regression.

## What it does

1. Reads the fixture pair:
   - `fixtures/adapter/legacy/{adapter_core.py, app_a/glue_a.py}` →
     `fixtures/adapter/target/{adapter_core.py, app_b/glue_b.py}`
     (adapter relocation App A → App B, so the dual-oracle rows are stress-tested:
     core seam re-pointed A→B while pure logic is preserved, ordering guarantee
     silently delegated to the B provider, host glue conforms to B not A,
     legacy-A residue, host-B-only requirement missing).
2. Reproduces the classification a generated checklist must surface: it checks that
   every expected finding (see `expected-findings.md`) is still detectable from the
   generated artifact's shape.
3. Fails loudly if any finding is lost — e.g. after someone edits the templates to a
   generic six-item list or drops the dual-oracle rows.

## Structure

```
smoke-example/
  run-smoke.ps1            # deterministic regression driver (exit 0/1)
  expected-findings.md     # the 5 findings the fixtures must surface
  fixtures/
    adapter/
      legacy/adapter_core.py    # adapter core: host-acquisition seam (A:ATLAS_FX) + owned ordering guarantee
      legacy/app_a/glue_a.py    # host A glue (ATLAS: env key, "error", label)
      target/adapter_core.py    # core relocated — seam re-pointed to B:ORB_FX; ordering delegated to provider
      target/app_b/glue_b.py    # host B glue (ORB_SECTION, reason, display + A residue)
```

## When to run

- After editing `assets/skill-template.md`, `references/methodology.md`, or
  `references/self-check.md` in the generate side.
- When extending the fixtures with a new A6 lesion class, add a finding expectation
  here first (TDD-style), then make the templates produce it.
