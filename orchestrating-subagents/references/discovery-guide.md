# Discovery Guide — Grounded Grilling Agenda

> Loaded in Phase 1 (to build the agenda) and Phase 2 (to frame questions).

Grounded grilling = read first, form a hypothesis, then interview one question at a time with a recommended answer. This file is the decision tree the grilling walks. It is **not** a script to read aloud — it is the knowledge that lets you ask only the questions the input genuinely leaves open.

## How to use this

1. In Phase 1, walk the decision tree below against your tentative design. Every node where the input + your hypothesis already produce a confident answer → skip. Every node where a real choice remains → that's a gap; add it to the agenda.
2. Order the agenda **top-down**: pattern → workers → tools → model → iteration → nesting → invocation → output. Later decisions depend on earlier ones.
3. In Phase 2, ask one agenda item at a time. For each: state your recommended answer (with the reason), offer the alternatives, wait.
4. Stop when the **worker decomposition** is fully resolved (that is the gate). Remaining items (output dir, filenames) can be settled as part of producing.

**Never ask a question the input already answers.** That is the cardinal sin of lazy grilling.

---

## Decision tree

### D1 — Pattern selection
**Resolve first — everything downstream depends on it.**

| Signal in the input | Pattern |
|---|---|
| Staged pipeline, different tools per stage, build/refactor | Pattern 1 — Coordinator+Worker |
| Review/analysis wanting independent lenses | Pattern 2 — Multi-perspective |
| Same job, want model consensus | V3 — Multi-model consensus |
| Homogeneous work, input too big and splittable | V4 — Recursive |
| Only one stage needs isolated context | V1 — Research-then-implement |
| N parallel analyses → action plan (not review) | V2 — Parallel fan-out |
| N alternative solutions researched in isolation → compare → recommend | V2 — Explore multiple solutions |
| None of the above / one call would do | **NONE — do not orchestrate** |

**Ambiguity to grill:** if the input could be Pattern 1 *or* Pattern 2 (e.g. "review and then fix"), ask which axis matters more — staged iteration (→ P1) or perspective independence (→ P2). Recommend based on whether iteration is real.

**Seed question:** "This looks like a {pattern} because {reason}. The closest alternative would be {alt}. Use {pattern}?" — with recommendation.

### D2 — Worker decomposition
**The gate decision. Spend the most grilling budget here.**

Walk these tests (from `pattern-catalog.md`):
- **MECE:** do any two candidate workers overlap? Is anything in the job uncovered?
- **One-capability:** does each worker have a single verb?
- **Heterogeneous vs homogeneous:** Pattern 1 needs heterogeneous workers (different jobs/tools); Pattern 2 needs homogeneous (same job, different lens).

**Ambiguity to grill:**
- Two workers seem to share a capability → "Worker A and Worker B both touch X. Merge into one, or split the seam at {boundary}?"
- A stage is unnamed → "Between {prev} and {next}, is there a distinct {role} step, or does {prev} hand straight to {next}?"
- Worker count too high → "You've named {N} workers. {N} coordinators lose thread of results; can {a,b} merge?"

**Recommendation heuristic:** start from the fewest workers that satisfy MECE + one-capability. Add a worker only when a capability has no home.

**Seed question:** "Proposed workers: {list with one-line responsibility each}. They're MECE because {reason}. Confirm or adjust the seams?"

### D3 — Tool boundaries (per worker)
Apply the **minimal-tool test**. Read-only workers never get `edit`.

**Ambiguity to grill:** a worker whose stage sounds read-only but might need to write (e.g. "Reviewer that also leaves comments in code"). Recommend read-only by default; only grant `edit` if the worker genuinely mutates files.

**Seed question:** "{Worker} is read-only analysis → tools: read, search. It does not need edit. Agree?"

### D4 — Model routing
Route a cheaper model to a worker only when: narrow job, no quality drop, tier ≤ coordinator's.

**Ambiguity to grill:** only ask if a worker is a strong candidate for a cheaper model (Implementer on boilerplate, Reviewer on a fixed checklist) AND the user cares about cost. If the user has not mentioned cost/models, do **not** ask — default to inheriting the main model.

**Seed question (only if cost surfaced):** "{Worker} is narrow enough to run on {cheaper model}. Route it there to save cost, or keep parity?"

**Model name strings:** load `references/copilot-models.md` for the GitHub Copilot catalog (e.g. the GPT-5.6 family `GPT-5.6 Luna (copilot)` / `Sol` / `Terra`) and routing heuristics. Remember: only the *model* is settable per worker — reasoning level and context size are not (see `assets/frontmatter-spec.md`).

### D5 — Iteration points (Pattern 1 only)
Name every feedback loop explicitly. If none exists, question whether Pattern 1 is right.

**Ambiguity to grill:** "After Reviewer runs, should findings flow back to Implementer until it converges, or is it one-pass?" Recommend the loop that matches the job (review-fix almost always iterates; plan-architect iterates until no reusable pattern is missed).

**Seed question:** "Loop: Reviewer → Implementer → Reviewer until no issues. Include the loop, or one-pass?"

### D6 — Nesting (rare)
Only relevant if a worker itself needs to delegate. Default: no nesting. If the user wants divide-and-conquer over a large homogeneous input, route to V4 instead of nesting inside Pattern 1.

**Ambiguity to grill:** raise only if the input explicitly describes splitting a large homogeneous workload. Otherwise skip silently.

**Seed question (if raised):** "{Worker} would need to spawn its own subagents, which requires enabling `chat.subagents.allowInvocationsFromSubagents` (max depth 5). Restructure as a recursive agent, or keep it flat?"

### D7 — Invocation control
Workers are typically `user-invocable: false` (internal-only). Only set `user-invocable: true` on a worker if the user wants to also trigger it directly from the chat dropdown.

**Ambiguity to grill:** rarely ambiguous. Default all workers to `user-invocable: false` and mention it as a stated assumption rather than a question, unless the user has indicated they want standalone access to a specialist.

### D8 — Output location & filenames
Settle last. Needs a target directory and a filename per agent (the coordinator + each worker). Default detection: workspace `.github/agents/`, personal `~/.copilot/agents/`. Other locations require the `chat.agentFilesLocations` setting.

**Ambiguity to grill:** "Write to {dir}? Filenames: {coordinator}.agent.md + {worker}.agent.md per worker. Overwrite if present?"

---

## Building the agenda (Phase 1 output)

Produce a short agenda like:

```
Agenda:
- D2 workers — OPEN (input names 3 roles but A and B overlap on validation)
- D5 iteration — OPEN (review→fix loop not stated)
- D8 output   — OPEN (no dir given)
D1 pattern (P1), D3 tools (read-only except Implementer), D4 model (not raised),
D6 nesting (no), D7 invocation (workers internal) — RESOLVED by hypothesis, will state as assumptions.
```

Then in Phase 2, ask the OPEN items one at a time, top-down, and surface the RESOLVED items as stated assumptions for the user to override.

## Grilling etiquette

- **One question at a time.** Bundling is bewildering.
- **Always recommend.** Open-ended questions force the user to do your work.
- **Cite the reason.** "Recommend X because {test from catalog}" — not "X is fine".
- **Shut up once resolved.** Don't relitigate a node the user already settled.
- **The gate is the worker decomposition.** You may proceed once D2–D4 are confirmed — worker **names**, **responsibility**, **tools**, and **model** (per SKILL.md's gate). D8 (output dir) can stay open; settle it while producing.
