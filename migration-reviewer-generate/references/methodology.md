# Methodology — audit a migration before → after

Six pieces, in order. Each is a leading-word defined in SKILL.md. This reference is the authority; SKILL.md only points here.

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

## 4. Hidden behaviours & invariants (隐形行为)

Diff cannot see these. Sweep every scope line for:

- **Defaults**: optional-parameter fallbacks, `??`/or-default, catch-all `else`
- **Ordering**: sort of results, iteration order, serialization order — downstream may depend on it
- **Timing**: timeouts, retries, rate limits (present in legacy, absent/renamed in new)
- **Logging/audit**: audit records and log lines that compliance or consumers rely on
- **Error surface**: HTTP status codes, error codes, error message *text* — consumers may parse them
- **Invariants**: system-wide constraints never written down but enforced in code — state-machine transitions, "balance never negative", "all timestamps UTC", "created_at ≤ updated_at"

Check invariants even when individual rules are equivalent: isolated rules can each be right while their interaction shifts.

## 5. Verification tiers (验证梯队)

Static review (pieces 1–4) says "looks complete". Truth lives in execution. Pick the tier that fits the risk and evidence available:

| Tier | Method | Proves | Needs |
|---|---|---|---|
| 1 | static cross-check (this entire doc) | coverage looks complete | code access |
| 2 | characterization test (golden master) | given the same input, the same output | runnable legacy + input corpus |
| 3 | shadow traffic comparison | parity under production load | production traffic that both systems can run on |
| 4 | data reconciliation | migration data is lossless | new + old data stores (row counts, checksums, computed fields, FK integrity) |

- Golden master: pick a business function; run it on the legacy system with representative inputs (keep boundaries + error paths); capture output as fixtures; the new system must match field-by-field. Consider numeric tolerance for float / rounding; then upgrade the golden file only with a documented intended deviation.
- Characterization tests are safer than spec tests in migration: the production system's behaviour — including bugs — is what users depend on.

## 6. Equivalence report + human gate (等价报告与人类闸门)

The audit is not done until it is written down. Use `assets/report-template.md`. Structure:

1. **Summary** — counts (verified / improved / different / missing) + conclusion (release / fix-first)
2. **Rule-by-rule table** — ID, description, legacy location, new location, status
3. **Behavior differences** — legacy vs new vs *classification* (intentional improvement / acceptable deviation / regression)
4. **Missing rules** — why missing, risk, action
5. **Edge cases & invariants** — findings incl. mechanism changes (app-logic → DB constraint)
6. **Integration points** — API contract / data format / downstream match
7. **Recommendation + signatures**: release / remediation list / expert decision

**Human-in-the-loop gate**: a domain expert signs the report before the legacy system is retired. Only the genuinely ambiguous intentionality goes to the expert, not every row.

> Best practice: verify against the *inventory*, not against every line of code. Classify differences before deciding to fix — some are real improvements.