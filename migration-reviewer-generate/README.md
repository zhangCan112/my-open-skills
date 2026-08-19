# Migration Reviewer — Generate

The **generate half** of the migration-reviewer pair: from a real migration scene, produce a scenario-specific migration-review artifact — a standalone skill, a rule block appended to an existing skill, an agent topic/persona, or a one-off checklist. It is a methodology and best-practice guide: the checklist is written **from the scene**, never a template filled by assumption.

The **audit half** (`migration-reviewer-audit`) runs the actual before→after review on real code.

## What it produces

| User wants | Artifact | Template |
|---|---|---|
| a migration-review skill | `migration-review-<scene>/` folder | `assets/skill-template.md` |
| a migration rule in an existing skill | one markdown block | `assets/rule-template.md` |
| an agent migration-review topic | one markdown section | `assets/agent-topic-template.md` |
| a one-off checklist | short doc | (write directly) |

## Flow

0. **Diagnose** — extract source→target, scope, migration type, artifact form from the user's words before asking.
1. **Grill** — ask only the facts not yet settled, one question at a time, with recommended answers.
2. **Produce** — build the artifact from the six-piece methodology + the scene.
3. **Self-check + smoke** — verify it's migration-type-specific and run a real slice; get user sign-off.

## Regression smoke

`assets/smoke-example/run-smoke.ps1` verifies the templates still surface concrete
migration-type findings (not a generic overview) after any edit. Run after changing
`assets/` or `references/`:

```powershell
powershell -ExecutionPolicy Bypass -File .\assets\smoke-example\run-smoke.ps1
# exit 0 = pass, 1 = regression
```

## Example prompt

> 给我们 PaymentService 从 Java 单体迁到 Go 微服务的这次迁移写一个 review skill。重点检查行为是否完整、业务规则有没有悄悄变。

## Design notes

- Written per `writing-for-agents`: SKILL.md stays a thin orchestrator; methodology and templates are externalized.
- Phase 0 diagnose-first + Phase 1 one-question-at-a-time grill — grounded, never invented.
- The three artifact templates are equal citizens; producing "a skill" is only one branch, not the default.
- A6 (adapter relocation / re-host) is a first-class methodology variant: dual oracle (legacy core / host-B contract), `RE-POINTED` seam rows, `INTENDED` glue divergence, B-touchpoint conformance, legacy-A residue sweep — mapped per methodology piece in `references/methodology.md`.

## License

MIT