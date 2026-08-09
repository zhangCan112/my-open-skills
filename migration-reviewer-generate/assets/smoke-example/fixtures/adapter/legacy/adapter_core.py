# adapter_core.py — framework-adapter logic + host-acquisition seam.
# Re-host rule (A6): the core is audited for BEHAVIOUR vs this legacy core —
# ordinary relocation legitimately re-points the acquisition seam (PROVIDER_SOURCE)
# to the new host. Byte-identical is only the zero-coupling special case, not
# the requirement; a change here is a finding to classify, not a red flag.
SUPPORTED = {"USD", "EUR", "GBP"}
PROVIDER_SOURCE = "A:ATLAS_FX"  # host-acquisition seam (A provider)


def normalize_currency(code):
    c = (code or "").upper()
    if c in SUPPORTED:
        return c
    if c == "USDT":
        return "USD"
    return c