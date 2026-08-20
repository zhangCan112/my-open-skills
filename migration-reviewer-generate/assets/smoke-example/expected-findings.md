# Expected findings — generate-side smoke (adapter relocation)

Run the regression: `.\run-smoke.ps1`

These findings are the **expected output** of running the generated checklist's dual-oracle classification
over the fixture pair. A passing smoke must surface every one of them; otherwise the generate
side or its templates have regressed into a generic overview.

## Scene — framework adapter relocated App A → App B (adapter relocation / re-host)

Files: `fixtures/adapter/legacy/{adapter_core.py, app_a/glue_a.py}` →
`fixtures/adapter/target/{adapter_core.py, app_b/glue_b.py}`.

The scene splits into an **adapter core** (framework-adapter logic — audited for
behaviour vs the legacy core, NOT byte-identity) and a **host glue** (per-host wiring).
The glue's spec is **host B's contract**, NOT the legacy host-A glue: a glue that diverges from
A while conforming to B is the intended outcome (`INTENDED`), never a regression. The core's
host-acquisition seam `PROVIDER_SOURCE` is legitimately re-pointed `A:ATLAS_FX` →
`B:ORB_FX` (`RE-POINTED`). Tag vocabulary is defined in `references/methodology.md` (dual-oracle variant).

| # | Tag | Finding | Why diff alone misses it |
|---|---|---|---|
| F1 | `RE-POINTED` | Adapter core relocated: the **host-acquisition seam** `PROVIDER_SOURCE` re-pointed `A:ATLAS_FX` → `B:ORB_FX` while `normalize_currency` logic is carried over (behavior preserved, verified by adapting the legacy contract tests, not byte-identity) | A plain diff sees the changed seam line and flags a `DIFFERS`; the dual-oracle classification marks it the intended host re-pointing and asks for a behavior check, not a red flag |
| F2 | `INTENDED` | Host glue rewired to B's rules: old `ATLAS_MODE`/`"error"`/`label` glue replaced by `ORB_SECTION`/`reason`/`display` — this diverges from A and is **correct**, not a `DIFFERS` regression | The standard "old behaviour is the spec" rule would flag A→B glue changes as gaps; the dual-oracle classification re-anchors them to B |
| F3 | DIFFERS | Legacy-A residue leaked into B's glue: `LEGACY_WIRE = "ATLAS"` carried over into the new host region | Fine on a diff (constant survived), but it is A-specific state that must not reach B |
| F4 | MISSING | Host-B-only requirement absent: B requires `emit_metric(name)` on every published render; the relocated `view()` never calls it | Nothing was lost *versus A*, so a legacy-vs-new comparison misses it — only the B contract spots it |
| F5 | DIFFERS | Ordering guarantee silently delegated to the provider: legacy core `sorted(raw)` (A:ATLAS_FX returns unsorted; the core owned ordering) vs relocated core `list(raw)` (assumes B:ORB_FX pre-sorts). The seam re-point itself is correct — the *behavior through the seam* drifted | The diff shows an innocent-looking simplification; only "verify behavior through the seam, not the pointer" + the hidden-behaviour (ordering) lens catches it |

## Golden-master fixtures (tier 2)

Feed the same normalized currency corpus to both cores {USD, EUR, GBP, USDT, JPY, None}; assert both cores produce identical `normalize_currency` output for the corpus. Feed rate lists {sorted, reverse-sorted, duplicate} through both `ordered_rates` to expose the F5 drift. Run each host's glue against its own contract fixtures (B's glue against B's contract).
