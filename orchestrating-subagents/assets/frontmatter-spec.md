# VS Code Custom Agent `.agent.md` Frontmatter Spec

> Loaded in Phase 3. Reference for valid frontmatter fields when generating coordinator and worker files.

VS Code custom agents are Markdown files (commonly `.agent.md`) with a YAML frontmatter block. The body is the agent's system prompt. This page documents the subset this skill emits; the full field list also includes `target`, `mcp-servers`, `handoffs`, `hooks`, and the deprecated `infer`. Fields:

## Fields

### `name` *(recommended — falls back to the file name)*
The agent's identifier. If omitted, the file name is used — but always set it explicitly so coordinators can reference it unambiguously. Used by coordinators in their `agents:` list — **must match exactly**.

```yaml
name: Plan Architect
```

Naming: short, role-based, distinct. Avoid names that collide with other agents in the workspace (the model may pick the wrong one).

### `description` *(optional but recommended)*
One line on what the agent does. Shown as placeholder text in the chat input field, and it helps the model pick the right agent when names/descriptions are similar. Keep it about the agent's job, not its internal procedure.

### `tools` *(optional)*
List of tools the agent may use. Defaults to inheriting the parent session's tools.

- Coordinator must include `agent` (a.k.a. `runSubagent`) to delegate — without it, no subagents. Add `edit` only if the coordinator itself assembles/writes final artifacts (a pure review/analysis coordinator does not need it).
- Read-only workers: `['read', 'search']`
- Write workers: `['edit', 'read', 'search']`

```yaml
tools: ['agent', 'edit', 'search', 'read']
```

### `agents` *(optional)*
Restricts which custom agents this agent may invoke as subagents. Values:
- A list of agent names → allow only those
- `'*'` → allow all available (default)
- `[]` → forbid any subagent use

```yaml
agents: ['Planner', 'Plan Architect', 'Implementer', 'Reviewer']
```

**Override rule:** explicitly listing an agent in `agents:` overrides that worker's `disable-model-invocation: true`. So you can make a worker protected from general use but still reachable by its own coordinator.

Use `agents:` whenever two agents could be confused, or to make the team explicit.

### `user-invocable` *(optional, default `true`)*
- `true` → appears in the chat agents dropdown (user can trigger directly)
- `false` → only accessible as a subagent (typical for workers)

```yaml
user-invocable: false
```

Set workers to `false` so they don't clutter the dropdown.

### `disable-model-invocation` *(optional, default `false`)*
- `true` → other agents cannot invoke this as a subagent; only explicit user triggers
- `false` → available as a subagent (default)

Combine with the `agents:` override: a worker can be `disable-model-invocation: true` generally, but still callable by a coordinator that lists it in `agents:`.

### `model` *(optional)*
A single model name or a prioritized list. Resolution order at runtime:
1. Explicit model passed when the coordinator calls `runSubagent`
2. This `model:` field
3. The parent session's model

```yaml
model: ['Claude Haiku 4.5 (copilot)', 'Gemini 3 Flash (Preview) (copilot)']
```

**Cost-tier cap:** the requested model cannot exceed the cost tier of the main model. A higher tier silently falls back. Route cheaper models to narrow workers only.

**Which strings to use:** see `references/copilot-models.md` for the GitHub Copilot model catalog (qualified form `Model Name (copilot)`, e.g. `GPT-5.6 Luna (copilot)`), routing heuristics, and a staleness note. Load it when picking per-worker models.

### NOT settable per-agent (do not invent these fields)

These are commonly expected but **not** supported in `.agent.md` frontmatter. Emitting them does nothing (or risks being ignored). Do not add them to coordinator or worker files.

| Concern | Reality | Where it IS controllable |
|---|---|---|
| **Thinking effort / reasoning effort** | No frontmatter field. Per-agent thinking effort is not a concept. | Session-level only: model picker → `>` → **Thinking Effort** (None/Low/Medium/High), remembered per session. The old `github.copilot.chat.anthropic.thinking.effort` / `github.copilot.chat.responsesApiReasoningEffort` settings are **deprecated**. For BYOK custom-endpoint models, `supportsReasoningEffort` / `reasoningEffortFormat` live in the **model definition** in `chatLanguageModels.json`, not the agent. |
| **Context length / window** | No frontmatter field. Determined entirely by the model the agent uses. | BYOK models declare `maxInputTokens` + `maxOutputTokens` (or `contextWindow`) in `chatLanguageModels.json`. Built-in Copilot models have fixed windows. |

**Implication for this skill:** when routing models per worker, you can only pick the **model**. You cannot tune thinking effort or context length per worker — so do not promise "route high-effort reasoning to the Planner" or "give the Reviewer a bigger window" in the generated files. If the user wants per-worker reasoning strength, the only lever is choosing a different model (e.g. a reasoning model vs a fast model).

### `argument-hint` *(optional, used for recursive agents)*
A short hint shown in the chat input field guiding what to pass to the agent. Essential for recursive (V4) agents so the delegated instance knows the input shape.

```yaml
argument-hint: A list of items to process
```

## Body (below the frontmatter)

The body is the agent's instructions. Rules of thumb:
- **Self-contained** — assume no prior context; the worker must do its job from this file alone.
- **One capability** — workers do one verb; don't smuggle a second job in.
- **Explicit delegation** — coordinators write `Use the X agent to …` as numbered steps; iteration loops written in prose.
- **Parallel = stated** — for Pattern 2, write `run these subagents in parallel` explicitly.

## Nested subagents

Off by default. To allow a subagent to spawn its own subagents (V4 recursive), the user enables:

```
chat.subagents.allowInvocationsFromSubagents
```

Max nesting depth: 5. If you produce a recursive agent, note this requirement next to the file so the user isn't surprised when nesting is blocked.

## Worked frontmatter — coordinator

```yaml
---
name: Feature Builder
description: Coordinates planning, architecture validation, implementation, and review of a feature.
tools: ['agent', 'edit', 'search', 'read']
agents: ['Planner', 'Plan Architect', 'Implementer', 'Reviewer']
---
```

## Worked frontmatter — read-only worker

```yaml
---
name: Plan Architect
description: Validates plans against the codebase and flags reusable patterns.
user-invocable: false
tools: ['read', 'search']
---
```

## Worked frontmatter — write worker on a cheaper model

```yaml
---
name: Implementer
description: Writes code to complete assigned tasks.
user-invocable: false
tools: ['edit', 'read', 'search']
model: ['Claude Haiku 4.5 (copilot)', 'Gemini 3 Flash (Preview) (copilot)']
---
```
