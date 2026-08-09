# adapter_core.py — portable framework-adapter logic (host-agnostic).
# This piece must come to the new host BYTE-IDENTICAL: it is the side whose
# oracle is the legacy code itself, not the new host's rules.
SUPPORTED = {"USD", "EUR", "GBP"}


def normalize_currency(code):
    c = (code or "").upper()
    if c in SUPPORTED:
        return c
    if c == "USDT":
        return "USD"
    return c