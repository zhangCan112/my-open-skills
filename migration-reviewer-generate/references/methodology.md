# Methodology — audit a migration before → after

Six pieces, in order. This reference is the authority; SKILL.md only points here. Adapter relocation / re-host (type A6) runs the same six pieces under a dual oracle — see the variant section at the end.

## 1. Behavior inventory (行为清单)

Enumerate **every** legacy behaviour of the scope, not skimming. Read all files in the scope. One behaviour per line, each with `file:line`.

Include:

- **Branches**: every `if/else`, ternary, switch case, template conditional — each branch is its own behaviour
- **Event handlers**: user interactions, lifecycle hooks, subscriptions
- **Derived state**: computed values, transformations, formatting (dates, URLs, labels)
- **Guards**: null/undefined checks, empty states, fallback values, default branches
- **Error paths**: try/catch, `.catch()`, error states, error messages, retries
- **I18n**: every user-visible string (copy exact text)
- **Side effects**: DB writes, events emitted, log/audit records, notifications

The inventory is a checklist: every row must appear in — or be intentionally omitted from — the new code.

## 2. Business Rules Inventory (规则清单)

Extract "what must be preserved" *before* comparing. Distinct from the behavior inventory: this is intent, not implementation.

Each rule: **ID** · description (a verifiable assertion) · legacy location · classification (critical/important/minor).

> Reuse first: if a Business Rules Inventory already exists (e.g. a CoreStory Phase 2 spec), load it as the base contract instead of deriving rules from scratch — the audit then checks *against* the inventory rather than rebuilding it. Derive only what the existing inventory omits.

Derivation questions to ask the code:

1. This input arrives → what output leaves? (validation, computation, transformation)
2. What conditions change that output? (if/switch/guard boundaries)
3. What side effects follow? (DB writes, events, notifications, logging)
4. What happens on error? (throw, degrade, retry, default fallback)

> Legacy code contains workarounds, dead code, obsolete behaviour. The inventory records what *should* be preserved — not every line.

## 3. Gap classification (差异三分类)

Compare source behaviours (from piece 1) against target. Classify **every** gap:

| Tag | Meaning | Severity |
|---|---|---|
| <kbd>MISSING</kbd> | behaviour absent in target entirely | high |
| <kbd>PARTIAL</kbd> | behaviour present but incomplete (missing branch/case) | medium, easy to overlook |
| <kbd>DIFFERS</kbd> | behaviour present but logic changed | high |

Rules of classification:

- Omissions count as `MISSING` unless the target carries an explicit "intentionally omitted" comment.
- Each gap gets category + severity + legacy ref + new-code ref (`file:line`, real path or none).
- `DIFFERS` states the specific difference (field, branch), not just "behaviour differs".
- Rebuttals for common rationalizations: "gaps are intentional" → intentional omissions need comments; undocumented gaps are bugs. "Edge cases won't happen" → legacy handled them for a reason; verify before removing. "We'll add it in a follow-up" → track as debt or fix now.

Report state is the five-way contract, per rule: **Equivalent** (verified identical) · **Improved** (deliberate, documented improvement) · **Different** (behaviour changed — carries gap tag + intent classification) · **Missing** (absent) · **NotVerified** (no evidence available). The gap tags above feed the state: a rule is `Improved` only when the change is deliberate and documented — an undocumented change is `DIFFERS`, never `Improved`. `NotVerified` is not a pass: when tier 2+ was impossible, mark the rule `NotVerified` instead of defaulting it to `Equivalent`.

> Adapter relocation (A6) extends this classification with two intent tags — `RE-POINTED` and `INTENDED` — defined in the A6 variant section at the end.

## 4. Hidden behaviours & invariants (隐形行为)

Diff cannot see these. Sweep every scope line for:

- **Defaults**: optional-parameter fallbacks, `??`/or-default, catch-all `else`
- **Ordering**: sort of results, iteration order, serialization order — downstream may depend on it
- **Timing**: timeouts, retries, rate limits (present in legacy, absent/renamed in new)
- **Logging/audit**: audit records and log lines that compliance or consumers rely on
- **Error surface**: HTTP status codes, error codes, error message *text* — consumers may parse them
- **Invariants**: system-wide constraints never written down but enforced in code — state-machine transitions, "balance never negative", "all timestamps UTC", "created_at ≤ updated_at"
- **Non-code artifacts**: business logic lives outside `.code()` too — DB constraints/triggers/stored procs, batch jobs/cron, config defaults (`application.yml`, env vars), message schemas, report definitions. Enumerate them in the inventory as first-class behaviours with a `kind: DB|batch|config|schema` tag.

Check invariants even when individual rules are equivalent: isolated rules can each be right while their interaction shifts.

## 5. Verification tiers (验证梯队)

Static review (pieces 1–4) says "looks complete". Truth lives in execution. Pick the tier that fits the risk and evidence available:

| Tier | Method | Proves | Needs |
|---|---|---|---|
| 1 | static cross-check (this entire doc) | coverage looks complete | code access |
| 2 | characterization test (golden master) + consumer-driven contract test | given the same input, the same output; every consumer's contract holds | runnable legacy + input corpus, or Pact/contract harness |
| 3 | shadow traffic comparison | parity under production load | production traffic that both systems can run on |
| 4 | data reconciliation | migration data is lossless | new + old data stores (row counts, checksums, computed fields, FK integrity) |

- Golden master: pick a business function; run it on the legacy system with representative inputs (keep boundaries + error paths); capture output as fixtures; the new system must match field-by-field. Consider numeric tolerance for float / rounding; then upgrade the golden file only with a documented intended deviation.
- Characterization tests are safer than spec tests in migration: the production system's behaviour — including bugs — is what users depend on.

## 6. Equivalence report + human gate (等价报告与人类闸门)

The audit is not done until it is written down. Use the equivalence report template (source copy: `migration-reviewer-audit/assets/report-template.md`; a generated skill copies it into its own `assets/`). Structure:

1. **Summary** — counts (verified / improved / different / missing / not-verified) + conclusion (release / fix-first / rewrite)
2. **Rule-by-rule table** — ID, description, legacy location, new location, status
3. **Behavior differences** — legacy vs new vs *classification* (intentional improvement / acceptable deviation / regression)
4. **Missing rules** — why missing, risk, action
5. **Edge cases & invariants** — findings incl. mechanism changes (app-logic → DB constraint)
6. **Integration points** — API contract / data format / downstream match
7. **Recommendation + signatures**: release / remediation list / expert decision

**Drift signal**: if `MISSING + DIFFERS` exceeds ~20% of enumerated behaviours, the "migration" has drifted into a rewrite — stop treating gaps as omissions to fix and call it out: `conclusion: rewrite, not migration`. Same for `[CHANGE]+[NEW]` intent tags during planning.

**Human-in-the-loop gate**: a domain expert signs the report before the legacy system is retired. Only the genuinely ambiguous intentionality goes to the expert, not every row.

> Best practice: verify against the *inventory*, not against every line of code. Classify differences before deciding to fix — some are real improvements.

## Adapter relocation / re-host (A6) — the dual-oracle variant

When the scene is *the same adapter re-hosted from App A to App B* (the framework-facing side of the adapter is unchanged), run the six pieces **per partition** under two oracles. Partition first (`diagnosis-guide.md` A6): `adapter core` (pure logic + its host-acquisition seams) vs `host glue` (per-host wiring).

- **Oracle 1 — the legacy core**, for the adapter core. The core is NOT assumed byte-identical: an adapter is coupled to the host it lives in (env/config keys, DI, clock, downstream providers — the "fat adapter" reality), and re-hosting legitimately re-points those seams. Everything else must preserve behavior.
- **Oracle 2 — host B's contract**, for the glue. Never legacy A's glue: a glue that diverges from A while conforming to B is the intended outcome. If B's contract is not written down, enumerating it (from B's docs, B's framework conventions, or sibling adapters already running in B) is a prerequisite deliverable — glue cannot be verified against an oracle that does not exist.

| Piece | Adapter core (oracle: legacy core) | Host glue (oracle: B's contract) |
|---|---|---|
| 1 Inventory | enumerate core behaviors vs the legacy core; every host-acquisition seam is a first-class row | enumerate B's mandatory touchpoints (auth, metrics/telemetry, banner, lifecycle hooks, config keys, error payload shape) — the B-contract inventory |
| 2 Rules | extract what must be preserved from the legacy core, as usual | rules = B's conventions from the B contract; preserve/translate/degrade/drop decisions for unhostable behaviors are recorded here, not improvised later |
| 3 Classification | vs the legacy core. Seam rewritten for B → `RE-POINTED` (expected change; still verify behavior). Behavior B cannot host → map **preserve / translate / degrade / drop**, each documented — an undocumented drop is `MISSING` | vs the B contract only. Glue diverging from A while conforming to B → `INTENDED`, never `DIFFERS`. Missing B touchpoint → `MISSING vs B`; surviving A-specific touchpoint → residue |
| 4 Hidden behaviours | core invariants and error surface carry over — check them, don't assume | A-residue sweep: A's field names, env keys, error text, table/queue names, log prefixes leaking into B |
| 5 Verification | tier 2 on both cores with the same corpus; compare **normalized** outputs (key order, float ε, timestamps/UUIDs, unordered collections; compare error *type* over text) — byte equality is neither required nor sufficient evidence. Include boundary/adversarial inputs, not just happy-path. A byte-identity claim requires a byte-oracle harness AND zero host coupling | run B's contract tests / re-run the port's contract tests in B ("the contract of an adapter is its tests"); walk the touchpoint checklist |
| 6 Report | every row carries an `oracle` column (`A-core` / `B-contract`); `RE-POINTED` and `INTENDED` are intent tags, not passes — each still needs its verification evidence | same |

**Drift guard, per partition**: if core `MISSING + DIFFERS` (excluding `RE-POINTED` / `INTENDED`) exceeds ~20% of enumerated core behaviors, the "relocation" has become a core rewrite — say so.