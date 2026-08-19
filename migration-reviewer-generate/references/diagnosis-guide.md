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
(source & target: the same adapter module re-hosted from App A to App B; the framework-facing side of the adapter is unchanged. Example: `framework → adapter core → host-A glue → App A` becomes `framework → adapter core → host-B glue → App B`.)

How each of the six pieces adapts per partition is defined in `methodology.md` ("A6 — the dual-oracle variant"). The scene diagnosis itself is four checks:

1. **Partition before diffing — three zones; every line in scope goes to exactly one:**
   - *pure core logic* (translation, validation, decisions) — oracle: the legacy core;
   - *acquisition seams inside the core* (env/config keys, DI, clock, downstream providers) — expected to be re-pointed to B; each is a `RE-POINTED` row to verify, not a red flag;
   - *host glue* (param/field names, error codes & text, status payload shapes, logging/audit prefixes, DI/lifecycle registration) — oracle: host B's contract.
2. **Dual oracle.** The core is audited for *behavior* vs the legacy core through the full methodology — never assumed byte-identical (adapters legitimately couple their host; only the zero-coupling special case may claim byte-identity, and only via a byte-oracle harness). The glue is audited only against B's rules; if B's contract is not written down, producing it is a prerequisite deliverable.
3. **Two sweeps unique to A6.** *B-touchpoint conformance*: every hook B mandates (auth, metrics, banner, lifecycle, config keys) must be wired in the new glue — an absent one is `MISSING vs B` even though nothing was lost versus A. *Legacy-A residue*: A's env keys, field names, error text, table/queue names, or log prefixes surviving in B — a leak.
4. **Unhostable behaviors.** Core behaviors B's environment cannot support map to **preserve / translate / degrade / drop** — each documented; an undocumented drop is `MISSING`.

Worked micro-example: `assets/smoke-example/fixtures/adapter/` (seam re-point, glue rewired to B, A-residue, missing B touchpoint).

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