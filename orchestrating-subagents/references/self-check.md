# Self-check — Definition of Done for produced `.agent.md`

> Loaded in Phase 3. Run every item before showing the output to the user. Any failure → fix and re-check, do not deliver.

## Structural checks

- [ ] One coordinator `.agent.md` produced
- [ ] One `.agent.md` per confirmed worker, no extras, no missing
- [ ] Every file starts with valid YAML frontmatter fenced by `---`
- [ ] No unsupported fields invented — in particular **no** `thinking-effort`, `reasoning-effort`, `context-length`, `context-window`, or `max-tokens`. These are not settable per-agent (see `assets/frontmatter-spec.md`); only `model` is.
- [ ] Filenames use the agent's `name` kebab-cased (e.g. `Plan Architect` → `plan-architect.agent.md`); the coordinator's `agents:` list references `name`, not the filename
- [ ] Files written to the user-confirmed directory; overwrites confirmed

## Coordinator checks

- [ ] `tools:` includes `agent` (or `runSubagent`) — required to delegate
- [ ] `agents:` lists **exactly** the worker names (no typos, no extras, no missing)
- [ ] Body contains an **explicit numbered delegation flow** ("Use the X agent to …")
- [ ] Every iteration loop is written in prose ("if Reviewer finds issues, run Implementer again")
- [ ] If Pattern 2: body says "run these subagents **in parallel**" and ends with a synthesis step
- [ ] No actual domain work in the coordinator body — it orchestrates, workers do the work

## Worker checks (per worker)

- [ ] `name` matches an entry in the coordinator's `agents:` list
- [ ] `user-invocable: false` unless the user explicitly wanted standalone access
- [ ] Responsibility is **one capability** (single verb) — no compound jobs
- [ ] `tools:` is **minimal**:
      - read-only workers (Planner / Architect / Reviewer / Analyst) → only `read`, `search` — **no `edit`**
      - write workers (Implementer) → `edit`, `read`, `search`
- [ ] If `model:` set, its cost tier is **≤ the main model's tier** (the parent session model)
- [ ] Body is self-contained: a fresh agent with no prior context can do the job from this file alone
- [ ] No worker duplicates another worker's capability (MECE holds across the full set)

## Pattern-specific checks

**Pattern 1 (Coordinator+Worker):**
- [ ] At least one read-only analysis worker + one write worker (else it may not be a pipeline)
- [ ] Feedback loops named: plan↔architect, review↔implement (whichever apply)

**Pattern 2 (Multi-perspective):**
- [ ] Perspectives are genuinely independent (no perspective references another's findings)
- [ ] Synthesis step present and produces a prioritized/categorized summary

**V3 (Multi-model consensus):**
- [ ] Each parallel worker has a distinct `model:` but identical instructions
- [ ] Coordinator's job is to compare agree-vs-disagree, not to redo the analysis

**V4 (Recursive):**
- [ ] Agent lists **itself** in `agents:`
- [ ] Body contains an explicit **base case** (e.g. "≤ N items → process directly")
- [ ] `argument-hint` set so the model knows what to pass
- [ ] Note added that the user must enable `chat.subagents.allowInvocationsFromSubagents` (max depth 5)

## Consistency checks across the set

- [ ] Every worker `name` referenced in coordinator's `agents:` has a corresponding file
- [ ] No two files share a `name`
- [ ] If any worker has `disable-model-invocation: true`, it is also listed in the coordinator's `agents:` (listing overrides the flag) — otherwise the coordinator cannot call it
- [ ] Naming style is consistent across the team (same casing, same granularity)

## Final sniff test

- [ ] A user who wasn't in the grilling could drop these files into `.github/agents/` (workspace) or `~/.copilot/agents/` (personal) and describe the team's purpose in one sentence
- [ ] You did not add a worker "just in case" — every worker has a distinct, named capability
- [ ] The simplest viable pattern was chosen; you can justify each worker's existence

If any box is unchecked → return to Phase 3, fix, re-run this list. Do not deliver a partial pass.
