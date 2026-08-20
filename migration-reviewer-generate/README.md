# Migration Reviewer — Generate (adapter relocation / re-host, A6)

The **generate half** of the migration-reviewer pair, scoped to exactly one scene: **adapter relocation / re-host** — the same framework adapter moved from host App A to host App B. From a real re-host scene it produces a scenario-specific review artifact — a standalone skill, a rule block appended to an existing skill, an agent topic/persona, or a one-off checklist. It is a methodology and best-practice guide: the checklist is written **from the scene** (dual oracle: legacy core + host-B contract), never a template filled by assumption. The generated artifact is what runs on the real before/after code.

## What it produces

| User wants | Artifact | Template |
|---|---|---|
| a migration-review skill | `migration-review-<scene>/` folder | `assets/skill-template.md` |
| a migration rule in an existing skill | one markdown block | `assets/rule-template.md` |
| an agent migration-review topic | one markdown section | `assets/agent-topic-template.md` |
| a one-off checklist | short doc | (write directly) |

## Flow

0. **Diagnose** — confirm the A6 shape (same adapter, host A → B, framework face unchanged), partition the scene into core / seams / glue from the code, pick the artifact form — before asking anything.
1. **Grill** — ask only the facts not yet settled, one question at a time, with recommended answers.
2. **Produce** — build the artifact from the six-piece methodology + the scene.
3. **Self-check + smoke** — verify it's migration-type-specific and run a real slice; get user sign-off.

## Regression smoke

`assets/smoke-example/run-smoke.ps1` verifies the templates still surface concrete
A6 findings (dual-oracle classification, not a generic overview) after any edit.
Run after changing `assets/` or `references/`:

```powershell
powershell -ExecutionPolicy Bypass -File .\assets\smoke-example\run-smoke.ps1
# exit 0 = pass, 1 = regression
```

## Example prompt

> 我们的 payment adapter 要从 App ATLAS 整体搬到 App ORB，帮我写一个 review skill，重点查：核心逻辑搬过去行为没变、宿主 ORB 要求的钩子没漏、ATLAS 的东西没带进来。

## Design notes

- Written per `writing-for-agents`: SKILL.md stays a thin orchestrator; methodology and templates are externalized.
- Phase 0 diagnose-first + Phase 1 one-question-at-a-time grill — grounded, never invented.
- The three artifact templates are equal citizens; producing "a skill" is only one branch, not the default.
- A6 is the only scene: dual oracle (legacy core / host-B contract), `RE-POINTED` seam rows (enumerated by scanning, verified through behavior), `INTENDED` glue divergence, B-touchpoint conformance, legacy-A residue sweep — mapped per methodology piece in `references/methodology.md`.
- The partition heuristic ("would this line change if the host were C?") and the seam scan make partitioning mechanically checkable instead of judgment calls.

## License

MIT

[完整中文文档](./README.zh-CN.md)