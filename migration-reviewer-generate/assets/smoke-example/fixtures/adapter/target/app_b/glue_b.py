# app_b/glue_b.py — host glue for App B ("ORB" conventions).
# Host B is the NEW host: B's rules are the spec for this region — NOT the
# legacy A glue. Divergence from A's glue while conforming to B is intended.
import os
from adapter_core import normalize_currency

MODE = os.getenv("ORB_SECTION", "default")
REASON = "reason"
DISPLAY = "display"

LEGACY_WIRE = "ATLAS"  # leftover from host A — legacy-A residue, flagged by the checklist


def render_payload(code):
    return {DISPLAY: normalize_currency(code), "reason": None}


def view(code):
    payload = render_payload(code)
    # host B REQUIRED per-render metric: the B contract wants the emit-metric
    # hook called on every published render — this path forgot to call it
    # (MISSING vs B, invisible against legacy A which had no such hook).
    return payload