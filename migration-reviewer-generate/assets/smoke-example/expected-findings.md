# Expected findings — Python → Go fee-calc migration (smoke example)

Scene: `fixtures/legacy/calculate_fee.py` → `fixtures/svc/payments/fee.go` (cross-language rewrite).
These five findings are the **expected output** of running the generated checklist's classification
over the fixtures. A passing smoke must surface every one of them; otherwise the generate
side or its templates have regressed into a generic overview.

Run the regression: `.\run-smoke.ps1`

## Findings

| # | Tag | Finding | Why diff alone misses it |
|---|---|---|---|
| 1 | MISSING | `apply_coupon()` (case-insensitive `WELCOME-*` prefix coupon) has no counterpart; target only handles exact literal `"WELCOME10"` | The second function is simply absent — no diff line points at it |
| 2 | DIFFERS | Rounding: legacy `Decimal.quantize(ROUND_HALF_UP)` vs Go `math.Round` (half-away-from-zero) — edge values differ ±0.01 | Both sides "round to 2dp", only execution differs |
| 3 | DIFFERS | Error surface: `ValueError("…")` exception vs `fmt.Errorf` — consumers parsing error text/type break | Same message text, different mechanism |
| 4 | DIFFERS | Audit log text: legacy `amount=5` (repr) vs Go `%.2f` → `amount=5.00` | Machine-parsed text changed with same "shape" |
| 5 | DIFFERS | Numeric semantics: `Decimal(str(int))` exact vs Go `float64` loses precision >2^53 | Type change not flagged as behaviour change |

## Golden-master fixtures (tier 2)

amount ∈ {0.01, 0.005, 100, 4503599627370497}, country ∈ {US, CA, FR, GB}, coupon ∈ {WELCOME10, welcome10, WELCOME20}.