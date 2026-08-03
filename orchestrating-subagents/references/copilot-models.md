# GitHub Copilot Model Catalog (for the `model:` field)

> Loaded on demand when routing models to workers (Phase 2 D4 / Phase 3).
>
> **This list goes stale.** GitHub's own page says "Model availability is subject to change." Verify against the live model picker, or refresh from the source below, before relying on these names.
>
> - **Catalog current as of:** 2026-07-29 (GitHub docs page date)
> - **Authoritative source:** https://docs.github.com/en/copilot/reference/ai-models/supported-models

## Qualified-name format (what goes in `model:`)

The custom-agents docs specify the qualified form **`Model Name (vendor)`** — for Copilot-provided models the vendor is `(copilot)`. Always use the qualified form in frontmatter:

```yaml
model: 'GPT-5.6 Luna (copilot)'
# or a prioritized fallback list:
model: ['GPT-5.6 Sol (copilot)', 'GPT-5.6 Luna (copilot)']
```

Unqualified names (e.g. `GPT-5.2`) appear in some doc examples and may work, but the qualified form is the documented standard. Prefer it.

## The GPT-5.6 family (primary)

All three are OpenAI, **GA**, and (where confirmed) support **1M-token context window** and **configurable reasoning levels**:

| Qualified `model:` value | 1M context | Configurable reasoning |
|---|---|---|
| `GPT-5.6 Luna (copilot)` | ✅ | ✅ |
| `GPT-5.6 Sol (copilot)` | ✅ | ✅ |
| `GPT-5.6 Terra (copilot)` | ⚠️ verify in picker | ⚠️ verify in picker |

> If you only use the GPT-5.6 family, these three strings are your entire `model:` enum.

## Full current Copilot catalog (for model routing)

Use this when routing **cheaper/faster** models to narrow workers (the whole point of per-worker `model:`). GA unless noted.

**OpenAI:** `GPT-5 mini`, `GPT-5.3-Codex`, `GPT-5.4`, `GPT-5.4 mini`, `GPT-5.4 nano`, `GPT-5.5`, `GPT-5.6 Luna`, `GPT-5.6 Sol`, `GPT-5.6 Terra`
**Anthropic:** `Claude Fable 5`, `Claude Haiku 4.5`, `Claude Opus 4.5`, `Claude Opus 4.6`, `Claude Opus 4.7`, `Claude Opus 4.8`, `Claude Opus 4.8 (fast mode) (preview)`, `Claude Opus 5`, `Claude Sonnet 4.5`, `Claude Sonnet 4.6`, `Claude Sonnet 5`
**Google:** `Gemini 3.1 Pro` (public preview), `Gemini 3.5 Flash`, `Gemini 3.6 Flash`
**Microsoft:** `MAI-Code-1-Flash`
**Fine-tuned:** `Raptor mini` (fine-tuned GPT-5 mini)
**Moonshot AI:** `Kimi K2.7 Code`
**xAI:** `Grok 4.5`

(Again — append ` (copilot)` when writing into `model:`.)

## Routing heuristics for this skill

- **Cost-tier cap:** a worker `model:` cannot exceed the main model's cost tier; higher silently falls back to the main model. Route *down*, not up.
- **Narrow/write workers** (Implementer on boilerplate, Reviewer on a fixed checklist) → candidate for a cheaper tier (e.g. a `mini`/`nano`/`Flash`/`Haiku`).
- **Reasoning-heavy workers** (Planner, Architect) → keep on a reasoning-capable model.
- **Availability varies by plan and client** (Copilot Chat vs CLI vs cloud agent) — see the source page's per-client matrix before assuming a model is reachable.

## Critical reminder — NOT settable per-agent

Even on the 5.6 family, these are **picker/session-level choices only** and have **no** `.agent.md` frontmatter field:

- **Reasoning level** (None/Low/Medium/High) — chosen in the picker, remembered per session. Not per worker.
- **Context window size** (default vs 1M) — chosen in the picker. Not per worker.

So you can route a worker to `GPT-5.6 Luna (copilot)`, but you **cannot** from the agent file force "Luna on high reasoning" or "Luna with 1M context." The only per-worker lever is *which model*. If the user wants per-worker reasoning strength, the lever is choosing a different model (e.g. a `nano` vs a full `5.6`), not a reasoning-level field. See `assets/frontmatter-spec.md` → "NOT settable per-agent".

## Known unknown — subagent thinking effort is undocumented

The docs do **not** state what determines a subagent's thinking effort. What is documented:

- Subagent **model** resolution is a 3-level priority: explicit `runSubagent` model param → worker `model:` frontmatter → parent session model. The `runSubagent` tool exposes a *model* parameter; the docs mention **no effort parameter**.
- Thinking effort is a **session-level** picker setting (None/Low/Medium/High), with **adaptive reasoning** as the default (the model sets effort per-request by complexity).

What the docs **don't** say: whether a subagent inherits the parent session's picker effort, or runs at adaptive/default effort, or something else. There is no `.agent.md` frontmatter field for effort.

**Implication for this skill:** do **not** promise per-subagent reasoning control in the generated files or in grilling. You cannot emit "this worker runs at high effort" — there is no mechanism for it. The only lever is routing a different *model*. If the user asks for a high-reasoning worker, route it to a reasoning-capable model and stop there; flag that the specific effort level is not controllable from the agent file.
