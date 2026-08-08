# Diagnosis guide — scene classification + grill tree (Phase 0–1)

Two questions decide everything: **what kind of migration** and **what artifact to produce**. Diagnose from context first, then grill only the gaps.

## A. Classify the migration type

The type decides which behaviour categories the checklist must stress and which hidden behaviours are most likely dropped.

### A1. Cross-language runtime rewrite
(source: Java→Go, Python→JS, PHP→Go, etc.)
- Type system width: `int` overflow, `long`/`bigint`, float precision & rounding, NaN/Infinity handling
- Unicode / charset / collation / locale-sensitive sorting
- Date & time: timezone handling, DST, formatting
- Concurrency model: threads vs async vs goroutines — race on shared state
- Exception vs error-return semantics, panics vs thrown, error wrapping

### A2. Framework upgrade (same language)
(source: React class→hooks, Vue2→3, Django 3→4, Spring Boot upgrade)
- Lifecycle/hooks dependency changes (effects cleanup, memo deps)
- DI/config changes, default-behaviour differences, deprecations
- Framework state: context, routing, middleware, session
- Migration to new API that silently changed defaults

### A3. Service split / monolith → services
- **API contract**: request/response shape, error codes, pagination
- **Data ownership**: which service owns which tables; shared mutable state
- **Event timing**: async vs sync, ordering, retries, idempotency
- Auth/session/token passing across the boundary

### A4. DB → application layer
- Stored procs/triggers/views: specific semantics (NULL, default, rounding, cast rules, rowcount)
- Transaction boundaries drawn differently
- Constraint enforcement moved from DB to app (and vice versa)
- Error surface changes: SQLSTATE  → app exception codes

## B. Classify the artifact type

Read the user's request. Each points to a different output:

| User says | Artifact |
| --- | --- |
| "写个迁移 review 的 skill" | standalone skill (`assets/skill-template.md`) |
| "给这个 skill 补一条迁移规则" | rule block in existing skill (`assets/rule-template.md`) |
| "给 agent 加个迁移审查主题" | agent topic / persona (`assets/agent-topic-template.md`) |
| "出个这次迁移的检查清单" | one-off checklist (can be a short doc, no files) |
| not clear | pick "inferred later"; default to a checklist, and confirm with user |

## C. Facts to settle minimum (before Phase 2)

1. **source → target** — language/framework/paths of old and new.
2. **Scope** — the migration unit (module / path to diff, and what's out).
3. **Evidence** — what files/tests run; which verification tier reachable. (tier hierarchy: static → characterization/golden master → shadow traffic → data reconciliation)
4. **Artifact form** — from section B.

Everything else is branch/optional; have a recommended default and say when you're assuming.

## D. Optional branch questions (ask one at a time, only if scene leaves them open)

- Riskiest logic in scope (payments, state-machine, timezone, rounding)? → gets the highest tier.
- Downstream parsing error text / status codes / ordering? → hidden behaviour need.
- Data lossless requirement? → Tier 4 applies.

## When to stop

Stop when 1–4 confirmed (either stated by the user or inferred and explicitly confirmed). Ask the branch questions only if a gap remains. Otherwise move directly to Phase 2.