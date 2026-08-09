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

### A5. Library → new vendor / API
- **Dependency surface**: which package/version/endpoint replaces which; transitive deps drift
- **Error surface**: error codes, status text, exception types consumers may parse
- **Data shape**: request/response fields, formats, defaults, pagination/ordering
- **Deprecation behaviour**: old API silently changed defaults, removed overloads, feature-flagged paths

### A6. Adapter relocation / re-host (适配器搬迁)
(source & target: the same module moved/attached to a *different host app*; the framework-adapter piece stays put.
Example: `framework → adapter logic → host A glue → App A` becomes `framework → adapter logic → host B glue → App B`.)
- **Split the scene before diffing: `portable core` vs `host glue`.** Every line in scope goes to exactly one side — the framework-adapter logic that **must not change**, and the host wiring that follows that host's conventions (param/field names, env/config keys, error codes & text, status payload shapes, logging/audit prefixes, DI/lifecycle registration).
- **Two oracles, not one — the "old code is the spec" rule has a region boundary.** Legacy code is the spec **only** for the portable core (it should be byte-identical: any diff there is high-severity, either the piece wasn't portable or it was mutated in transit). The host glue's spec is **host B's rules**, not the old host-A code — a glue that now conforms to B and diverges from A is the *intended outcome*, not a regression to classify `DIFFERS`.
- **Legacy-A residue check**: the new glue must not carry A's own field names, env keys, error-text, table/queue names, or log format silently into B (host-specific state is a leak).
- **Host-B conformance check**: every B convention a host requires (auth, banner/section callback, telemetry id, event subject, config key) must be wired in the new glue — an absent B rule is `MISSING` against B, even if nothing was lost versus A.

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