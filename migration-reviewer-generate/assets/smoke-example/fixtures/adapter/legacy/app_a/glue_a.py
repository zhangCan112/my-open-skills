# app_a/glue_a.py — host glue for App A ("ATLAS" conventions).
# Host A is the OLD host: this glue follows A's rules (env key, error key,
# wire field). When the adapter relocates to B, THIS glue is replaced.
import os
from adapter_core import normalize_currency

MODE = os.getenv("ATLAS_MODE", "pilot")
ERR_KEY = "error"
FIELD = "label"


def render_payload(code):
    return {FIELD: normalize_currency(code), "error": None}


def log(code):
    payload = render_payload(code)
    print("ATLAS_LOG: %s" % payload)
    return payload