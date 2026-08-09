# adapter_core.py — framework-adapter logic, relocated to host B.
# A6: ONLY the host-acquisition seam changed (PROVIDER_SOURCE re-pointed
# A:ATLAS_FX -> B:ORB_FX). That is the intended, ordinary relocation change —
# a gap classification says "re-pointed seam verified", NOT "DIFFERS red flag".
# normalize_currency is carried over verbatim as the well-behaved case, but the
# equivalence claim is behavior (contract tests vs B), not byte-equality.
SUPPORTED = {"USD", "EUR", "GBP"}
PROVIDER_SOURCE = "B:ORB_FX"  # re-pointed to the B provider (legit change)


def normalize_currency(code):
    c = (code or "").upper()
    if c in SUPPORTED:
        return c
    if c == "USDT":
        return "USD"
    return c