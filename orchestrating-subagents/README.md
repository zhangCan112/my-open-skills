# orchestrating-subagents

Turn any input into a **VS Code / GitHub Copilot subagent orchestration** — one coordinator `.agent.md` delegating to specialized worker `.agent.md` files, each with isolated context, minimal tools, and an optional cheaper model.

Built on the [VS Code Subagents → Orchestration patterns](https://code.visualstudio.com/docs/agents/subagents#_orchestration-patterns) documentation.

## Manual-only (not auto-loaded)

This skill sets `disable-model-invocation: true` in its frontmatter. GitHub Copilot will **never** auto-load it by relevance — it only runs when you explicitly invoke it as a slash command:

```
/orchestrating-subagents [task, prompt, or workflow to convert]
```

This is intentional: the skill is an interactive, grounded grilling procedure, not ambient background knowledge.

## What it does

Give it a task, an existing single-agent prompt, or a workflow document. It:

1. Reads and classifies the input, running the **simpler-first gate** first (is a script / prompt file / workflow / single agent the better answer? if so, it says so and stops)
2. Loads the orchestration-pattern knowledge and forms a tentative design
3. Interviews you **one question at a time**, each with a recommended answer (grounded grilling)
4. Produces a coordinator `.agent.md` + one `.agent.md` per worker, then self-checks against a DoD checklist

It will **not** write files until you confirm the worker decomposition — that's the iron rule, because every orchestration fails or succeeds at the worker seams.

## When to use

- You want a coordinator + workers team (e.g. Planner / Architect / Implementer / Reviewer)
- You want parallel multi-perspective review with synthesis
- You want to split an overloaded single agent into isolated-context specialists

## When NOT to use

- One LLM call would do it — over-orchestration is the top failure mode
- The work is enumerable in advance / workflow-shaped → a prompt file or `designing-workflows` playbook fits better
- One-off task with no isolation benefit or amortization
- You want an opencode skill scaffold → use `skill-architect`
- You want a runtime workflow playbook → use `designing-workflows`

## Patterns supported

- **Coordinator + Worker** (build/refactor pipelines with iteration)
- **Multi-perspective parallel review** (independent lenses → synthesis)
- Variants: multi-model consensus, recursive divide-and-conquer, research-then-implement, parallel analysis fan-out

## Directory structure

```
orchestrating-subagents/
├── SKILL.md                       # thin orchestrator (always read)
├── README.md                      # this file
├── references/
│   ├── agent-vs-alternative.md    # upstream gate: orchestrate or not? (Phase 0)
│   ├── pattern-catalog.md         # patterns + decision tree (Phase 1)
│   ├── discovery-guide.md         # grounded grilling agenda (Phase 1–2)
│   ├── copilot-models.md          # GitHub Copilot model catalog for `model:` (Phase 2 D4 / 3)
│   └── self-check.md              # DoD checklist (Phase 3)
└── assets/
    ├── frontmatter-spec.md        # VS Code .agent.md frontmatter reference (Phase 3)
    ├── coordinator.agent.md       # coordinator template
    └── worker.agent.md            # worker template
```

Files are loaded progressively — `SKILL.md` stays thin; references load only in the phase that needs them.

## Install (GitHub Copilot / VS Code)

Copy the folder to any skill location GitHub Copilot scans:

```bash
# Personal skills (available in all your projects)
cp -r orchestrating-subagents ~/.copilot/skills/
# or ~/.claude/skills/ / ~/.agents/skills/ — GitHub Copilot scans these too

# Project skills (committed to the repo, shared with the team)
cp -r orchestrating-subagents .github/skills/
```

After changing skill files, restart VS Code / reload the session so the skill loader picks them up.

## License

MIT
