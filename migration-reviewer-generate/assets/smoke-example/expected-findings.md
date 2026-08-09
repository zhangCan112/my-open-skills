# Expected findings — generate-side smoke (two scenes)

Run the regression: `.\run-smoke.ps1`

These findings are the **expected output** of running the generated checklist's classification
over the fixture pairs. A passing smoke must surface every one of them; otherwise the generate
side or its templates have regressed into a generic overview.

## Scene 1 — Python → Go fee-calc migration (cross-language rewrite)

Files: `fixtures/legacy/calculate_fee.py` → `fixtures/svc/payments/fee.go`.

| # | Tag | Finding | Why diff alone misses it |
|---|---|---|---|
| F1 | MISSING | `apply_coupon()` (case-insensitive `WELCOME-*` prefix coupon) has no counterpart; target only handles exact literal `"WELCOME10"` | The second function is simply absent — no diff line points at it |
| F2 | DIFFERS | Rounding: legacy `Decimal.quantize(ROUND_HALF_UP)` vs Go `math.Round` (half-away-from-zero) — edge values differ ±0.01 | Both sides "round to 2dp", only execution differs |
| F3 | DIFFERS | Error surface: `ValueError("…")` exception vs `fmt.Errorf` — consumers parsing error text/type break | Same message text, different mechanism |
| F4 | DIFFERS | Audit log text: legacy `amount=5` (repr) vs Go `%.2f` → `amount=5.00` | Machine-parsed text changed with same "shape" |
| 5 | DIFFERS | Numeric semantics: `Decimal(str(int))` exact vs Go `float64` loses precision >2^53 | Type change not flagged as behaviour change |

## Scene 2 — framework adapter relocated App A → App B (adapter relocation / re-host)

Files: `fixtures/adapter/legacy/{adapter_core.py, app_a/glue_a.py}` →
`fixtures/adapter/target/{adapter_core.py, app_b/glue_b.py}`.

The scene splits into a **portable core** (host-agnostic framework-adapter logic, must be
byte-identical) and a **host glue** (per-host wiring). The glue's spec is **host B's rules**,
NOT the legacy host-A glue: a glue that diverges from A while conforming to B is the intended
outcome, never a regression.

| # | Tag | Finding | Why diff alone misses it |
|---|---|---|---|
| 6 | DIFFERS→NA | Portable core `adapter_core.py` stayed **byte-identical** (`normalize_currency` unchanged) — the re-hosted piece is untouched, verified equal to legacy | A naive diff would see "no change there" and skip it; the move is the risk, so identity is the check |
| 7 | INTENDED | Host glue rewired to B's rules: old `ATLAS_MODE`/`"error"`/`label` glue replaced by `ORB_SECTION`/`reason`/`display` — this diverges from A and is **correct**, not a `DIFFERS` regression | The standard "old behaviour is the spec" rule would flag A→B glue changes as gaps; the twin-oracle classification re-anchors them to B |
| 8 | DIFFERS | Legacy-A residue leaked into B's glue: `LEGACY_WIRE = "ATLAS"` carried over into the new host region | Fine on a diff (constant survived), but it is A-specific state that must not reach B |
| 9 | MISSING | Host-B-only requirement absent: B requires `emit_metric(name)` on every published render; the relocated `view()` never calls it | Nothing was lost *versus A*, so a legacy-vs-new comparison misses it — only the B contract spots it |

## Golden-master fixtures (tier 2)

Scene 1: amount ∈ {0.01, 0.005, 100, 4503599627370497}, country ∈ {US, CA, FR, GB}, coupon ∈ {WELCOME10, welcome10, WELCOME20}.

Scene 2: feed the same normalized currency corpus to both cores {USD, EUR, GBP, USDT, JPY, None}; run each host's glue against its own contract fixtures.