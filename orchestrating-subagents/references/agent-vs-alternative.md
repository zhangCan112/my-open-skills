# Agent or not? — the upstream gate (Anthropic lens)

> Loaded in **Phase 0**, before any pattern selection. Source: Anthropic, *Building effective agents* (Dec 2024) — https://www.anthropic.com/engineering/building-effective-agents. The VS Code artifact ladder and pattern mapping below are this skill's translation; the rules quoted are Anthropic's.

The biggest orchestration mistake is building agents at all. Anthropic's core rule:

> Find the simplest solution possible; only increase complexity when needed. Agentic systems trade latency and cost for better task performance — consider whether that tradeoff is worth it. Add complexity only when it demonstrably improves outcomes.

## Workflows vs agents (Anthropic's distinction)

- **Workflows** — LLMs and tools orchestrated through *predefined code paths*. Predictable, consistent, auditable.
- **Agents** — LLMs *dynamically direct* their own processes and tool use. Flexible, model-driven, but higher cost and compounding errors.

In VS Code, "workflow" ≠ subagent orchestration. Most workflow-shaped problems are better served by a prompt file, a workflow playbook, or a script — not `.agent.md` files.

## The artifact ladder — try simpler first

| Artifact | When it wins |
|---|---|
| script / tool set | fixed steps, deterministic, verifiable |
| prompt file | one-off or repeated fixed prompt, no files to manage |
| skill | needs domain knowledge loaded on demand |
| workflow playbook (`designing-workflows`) | multi-phase but predefinable |
| single custom agent | open-ended but one context is enough |
| coordinator + workers (this skill) | needs context isolation + dynamic delegation |

Only escalate down the ladder when the simpler rung provably fails. Over-orchestration is the top failure mode.

## When NOT to orchestrate (exit here — do not produce files)

- A single LLM call (with retrieval / in-context examples) would do.
- The steps are enumerable in advance → that's a workflow, not agents.
- Predictability / auditability / guarantees matter more than flexibility.
- The task is one-off (no amortization of the files).
- Stages share heavy intermediate state — context isolation would hurt.
- Parallel writers would conflict with each other.
- You need deterministic, verifiable output (compliance, CI).

## When orchestration IS justified

- **Context isolation materially helps** (research vs implement; main thread stays clean).
- **Parallel independence** — Anthropic's *parallelization*: sectioning (independent subtasks) or voting (same task, N attempts for confidence).
- **Different tools / permissions / model tiers per stage.**
- **Real iteration loops** — Anthropic's *evaluator-optimizer*: generate → evaluate → refine until clear criteria are met.
- **Unpredictable decomposition** — exactly Anthropic's *orchestrator-workers*: the orchestrator decides subtasks at runtime because they can't be predefined.

## Anthropic's patterns → VS Code mapping

| Anthropic building block | VS Code equivalent |
|---|---|
| Augmented LLM (retrieval + tools) | a single custom agent with a tailored `tools:` list |
| Prompt chaining | prompt file / workflow playbook — NOT agents |
| Routing | prompt file, or a router worker |
| Parallelization (sectioning / voting) | Pattern 2 multi-perspective / V3 multi-model consensus |
| Orchestrator-workers | Pattern 1 Coordinator+Worker |
| Evaluator-optimizer | the review→implement loop inside Pattern 1 |
| Agent (autonomous) | a single custom agent — orchestration only if it needs workers |

## Three principles when you DO build agents (folded into self-check)

1. **Simplicity** — one capability per worker (MECE + one-capability test); the simplest pattern that provably helps.
2. **Transparency** — the coordinator's planning/delegation steps are explicit (numbered delegation flow, iteration loops written in prose), never hidden.
3. **ACI (agent-computer interface)** — tools are minimal, well-documented, and hard to misuse; read-only workers never get `edit`; prefer unambiguous tool shapes. Invest as much in the agent's tool interface as you would in a human UI.

## Cost reality check

- Agents cost more: latency per step, more tokens, compounding errors. Anthropic: test in sandboxes, add guardrails and stop conditions.
- If the user is cost/latency-sensitive and the task is enumerable → recommend the simpler artifact instead of producing files.
