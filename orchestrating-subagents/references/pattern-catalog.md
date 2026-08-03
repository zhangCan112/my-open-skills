# Pattern Catalog — VS Code Subagent Orchestration

> Loaded in Phase 1. This is the lens for grounded discovery and grilling.

Subagent orchestration = a coordinator agent delegates subtasks to worker agents, each with isolated context, tailored tools, and possibly a cheaper model. Two patterns are first-class; the rest are variants chosen by exception.

---

## Pattern 1 — Coordinator + Worker

A coordinator owns the overall flow and delegates each stage to a specialist worker. Workers are **heterogeneous** (different jobs, different tools). Stages usually have **iteration loops** (plan↔architect, review↔implement).

**Shape:**

```
Coordinator (tools: agent + maybe edit/search)
  ├─ Planner worker        (read, search)        → produces a task breakdown
  ├─ Plan Architect worker (read, search)        → validates plan vs codebase
  ├─ Implementer worker    (edit, read, search)  → writes code
  └─ Reviewer worker       (read, search)        → checks implementation
```

**Use when:**
- The work is a **pipeline** of distinct stages (plan → implement → review)
- Stages need **different tool access** (read-only analysis vs write)
- Iteration between stages is expected (review finds issues → implement fixes)
- One context would be polluted by carrying all stages' detail

**Canonical example — Feature Builder:**

```markdown
---
name: Feature Builder
tools: ['agent', 'edit', 'search', 'read']
agents: ['Planner', 'Plan Architect', 'Implementer', 'Reviewer']
---
You are a feature development coordinator. For each feature request:
1. Use the Planner agent to break down the feature into tasks.
2. Use the Plan Architect agent to validate the plan against codebase patterns.
3. If the architect identifies reusable patterns or libraries, send feedback to the Planner.
4. Use the Implementer agent to write the code for each task.
5. Use the Reviewer agent to check the implementation.
6. If the reviewer identifies issues, use the Implementer agent again to apply fixes.
Iterate between planning and architecture, and between review and implementation, until each phase converges.
```

Workers (each `user-invocable: false`, tailored tools, optionally a cheaper model):

```markdown
---
name: Planner
user-invocable: false
tools: ['read', 'search']
---
Break down feature requests into implementation tasks. Incorporate feedback from the Plan Architect.
```

```markdown
---
name: Plan Architect
user-invocable: false
tools: ['read', 'search']
---
Validate plans against the codebase. Identify existing patterns, utilities, and libraries that should be reused. Flag any plan steps that duplicate existing functionality.
```

```markdown
---
name: Implementer
user-invocable: false
model: ['Claude Haiku 4.5 (copilot)', 'Gemini 3 Flash (Preview) (copilot)']
---
Write code to complete assigned tasks.
```

**Key mechanics:**
- `agents: [...]` on the coordinator **restricts** which workers it may call. Use it to prevent the model picking a wrong/similar-named agent.
- Listing an agent in `agents:` overrides that worker's `disable-model-invocation: true` — so you can have workers protected from general use but reachable by their coordinator.
- Iteration is **explicit in prose**, not implicit. Write the loop ("if reviewer finds issues, run Implementer again") in the coordinator body.

---

## Pattern 2 — Multi-perspective parallel review

One reviewer fans out **N independent perspectives in parallel**, then synthesizes. Workers are **homogeneous in role** (all reviewers) but **differ in lens**. No iteration — single pass, then synthesis.

**Shape:**

```
Thorough Reviewer (tools: agent, read, search)
  ├─ correctness reviewer   (parallel)  → logic errors, edge cases, types
  ├─ quality reviewer       (parallel)  → readability, naming, duplication
  ├─ security reviewer      (parallel)  → input validation, injection, exposure
  └─ architecture reviewer  (parallel)  → patterns, design consistency
  → synthesize into prioritized summary
```

**Use when:**
- The task is **review/analysis**, not staged building
- Each perspective benefits from being **unanchored** by the others' findings
- A single pass would miss issues visible only through a different lens

**Canonical example — Thorough Reviewer:**

```markdown
---
name: Thorough Reviewer
tools: ['agent', 'read', 'search']
---
You review code through multiple perspectives simultaneously. Run each perspective as a parallel subagent so findings are independent and unbiased.

When asked to review code, run these subagents in parallel:
- Correctness reviewer: logic errors, edge cases, type issues.
- Code quality reviewer: readability, naming, duplication.
- Security reviewer: input validation, injection risks, data exposure.
- Architecture reviewer: codebase patterns, design consistency, structural alignment.

After all subagents complete, synthesize findings into a prioritized summary.
Note which issues are critical vs nice-to-have. Acknowledge what the code does well.
```

**Lightweight vs heavyweight:**
- **Lightweight (above):** the coordinator shapes each perspective **through its prompt**. No extra agent files needed. Fast to build, easy to retune.
- **Heavyweight:** each perspective is its own custom agent with specialized tools (e.g. security reviewer uses a security MCP server; quality reviewer runs a linter). More control, more files. Pick heavyweight only when perspectives genuinely need different tools.

---

## Variants (choose by exception)

### V1 — Research-then-implement
A single subagent researches; the main agent implements using only the recommendation. **Not really orchestration** — it's one delegation. Use when only the research needs isolated context, not the implementation. Degenerates to a one-worker coordinator.

### V2 — Parallel analysis fan-out / explore multiple solutions
N homogeneous analyses run in parallel (find duplicates / find dead code / check error handling / check security), compiled into one action plan. Like Pattern 2 but the output is a **plan**, not a review. Also covers the doc's **explore-multiple-solutions** scenario: isolated research on N alternative approaches (e.g. Redis vs in-memory LRU vs hybrid caching), compared into a recommendation. Workers are analysis-only (`read`, `search`).

### V3 — Multi-model consensus
Same task, different models, compare agree/disagree. Use when you want to surface model-blind-spots on a high-stakes judgment. Mechanically identical to Pattern 2, but each parallel worker has a different `model:` and identical instructions.

### V4 — Recursive divide-and-conquer (nested)
An agent lists **itself** in its own `agents:` and splits large inputs into halves, delegating each half to a new instance of itself. Use only for **homogeneous, size-bounded** work (process a list > N items by splitting).

**Requirements & cautions:**
- Needs the `chat.subagents.allowInvocationsFromSubagents` setting enabled (off by default).
- Max nesting depth: 5.
- Must include a clear **base case** (e.g. "≤ 4 items → process directly") or it recurses forever.
- Provide `argument-hint` so the model knows what to pass.

```markdown
---
name: RecursiveProcessor
tools: ['agent', 'read', 'search']
agents: [RecursiveProcessor]
argument-hint: A list of items to process
---
You process a list of items by dividing and conquering:
- If the list has more than 4 items, split it in half and delegate each half to a RecursiveProcessor subagent.
- If the list has 4 or fewer items, process the items directly.
- Merge the results from each subagent into a final result.
```

---

## Decision tree — picking a pattern

First run the **upstream gate** (`references/agent-vs-alternative.md`):
a script, prompt file, skill, workflow playbook, or single custom agent would serve better → **STOP** — do not orchestrate. Only pick a pattern if `.agent.md` isolation genuinely helps.

```
Is the work a staged pipeline with different tools per stage?  → Pattern 1 (Coordinator+Worker)
Is it review/analysis wanting independent lenses?              → Pattern 2 (Multi-perspective)
Same job, different models, want consensus?                    → V3 (Multi-model consensus)
Homogeneous work, input too big, splittable?                   → V4 (Recursive)
Only one stage needs isolated context?                         → V1 (Research-then-implement)
N parallel analyses → one action plan (not a review)?          → V2 (Parallel fan-out)
N parallel solution designs → compare → recommend?              → V2 (explore multiple solutions)
A single LLM call would do?                                    → NONE. Do not orchestrate.
```

Combine when needed: Pattern 1 commonly embeds a Pattern 2 review stage; V3 can be the engine inside a Pattern 2 reviewer.

---

## Worker decomposition heuristics

Decomposition quality determines orchestration quality. Use these tests.

### MECE test
Workers must be **mutually exclusive, collectively exhaustive**:
- No two workers own the same capability (exclusive)
- Together they cover the whole job with nothing dropped (exhaustive)
- If two workers overlap → merge them, or split the seam cleanly

### One-capability test
Each worker owns **one** clear capability with one verb: *plans*, *validates*, *implements*, *reviews*, *analyzes-X*. A worker with a compound responsibility ("plans and reviews") is two workers or a poorly cut seam.

### Minimal-tool test
Grant the fewest tools that let the worker do its job:
- Read-only workers (Planner, Architect, Reviewer, Analyst): `read`, `search` — **never** `edit`
- Write workers (Implementer): `edit`, `read`, `search`
- Coordinator: `agent` (required) + whatever final assembly needs

### Model-routing test
Route a **cheaper/faster** model to a worker only when:
- Its job is narrow and well-defined (Implementer writing boilerplate, Reviewer running a checklist)
- Quality won't drop materially
- The model's cost tier is **≤ the main model's** (VS Code rejects higher tiers and falls back)

### Iteration test
For Pattern 1, name every feedback loop explicitly:
- plan ↔ architect (reusable patterns found → replan)
- review ↔ implement (issues found → refactor)
- If you can't name a loop, you may not need a coordinator at all — consider a simpler pattern.

---

## Anti-patterns

| Smell | Why it fails |
|---|---|
| **Over-orchestration** — coordinator + 4 workers for a 1-call task | Latency, cost, and the coordinator forgets what workers did. Simplest pattern that provably helps. |
| **Overlapping workers** — Planner and Architect both "analyze the codebase" | Results collide, responsibility is ambiguous, model calls the wrong one. Re-cut to MECE. |
| **Tools over-granted** — Reviewer with `edit` | Reviewer starts fixing instead of reporting; defeats isolated context. Minimal privilege. |
| **Coordinator does the work** — body has no `Use the X agent` steps | It's one agent in a trench coat. Either add real delegation or drop to a single agent. |
| **Implicit iteration** — "review, then fix" without naming the worker | Model stops after one pass. Write the loop in prose. |
| **Recursive agent without a base case** | Infinite recursion (capped at depth 5, but still wastes the run). Always include the base case. |
| **Mismatched `agents:` list** — coordinator lists a name that doesn't match a worker's `name` field | Runtime can't find it; or model picks an unintended same-named agent. Match the `name` fields exactly. |
