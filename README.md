# my-open-skills

A personal collection of AI Agent Skills.

## Skills

| Skill | Description | Docs |
|-------|-------------|------|
| [writing-skills](./writing-skills/) | Guide to creating, editing, and verifying high-quality AI Agent Skills | [README](./writing-skills/README.md) |
| [evolving-skill-rules](./evolving-skill-rules/) | Extract generalizable rules from skill failure cases | [SKILL.md](./evolving-skill-rules/SKILL.md) |
| [splitting-skills](./splitting-skills/) | Decompose large skills or structured knowledge into multiple independent, reusable Agent Skills | [SKILL.md](./splitting-skills/SKILL.md) |
| [dependency-migrator](./dependency-migrator/) | Template for code dependency/API migration via a user-maintained rule library (pattern + solution) | [README](./dependency-migrator/README.md) |
| [enterprise-knowledge](./enterprise-knowledge/) | Queryable knowledge base for enterprise internal code & frameworks, with a guided authoring mode for adding knowledge (trigger + detail) | [README](./enterprise-knowledge/README.md) |
| [release-test-focus](./release-test-focus/) | Compile a release's main-project and dependency tickets into a tester-facing brief (must-test priorities + regression scope) | [README](./release-test-focus/README.md) |
| [designing-workflows](./designing-workflows/) | Turn an AI goal into a reusable, layered workflow playbook (capability-inventory-driven, begin-with-the-end-in-mind) | [SKILL.md](./designing-workflows/SKILL.md) |
| [skill-architect](./skill-architect/) | Pick the right structural pattern for a skill, scaffold from a template, or refactor a messy SKILL.md into a modular architecture | [SKILL.md](./skill-architect/SKILL.md) |
| [orchestrating-subagents](./orchestrating-subagents/) | Turn a task, prompt, or workflow into a VS Code subagent team (coordinator + worker `.agent.md` files) via grounded grilling | [README](./orchestrating-subagents/README.md) |
| [migration-reviewer-generate](./migration-reviewer-generate/) | Adapter-relocation review generator meta-skill — for a re-host (same adapter, host A → host B) produce its dual-oracle review checklist, skill, rule block, or agent topic | [README](./migration-reviewer-generate/README.md) |

## Plugins

| Plugin | Description | Docs |
|--------|-------------|------|
| [skill-tracker](./plugins/skill-tracker/) | OpenCode plugin that monitors, logs, and visualizes skill tool invocations in real time | [README](./plugins/skill-tracker/README.md) |

## Installation

Copy the skill folders to your AI tool's skills directory. For example, Claude Code:

```bash
cp -r writing-skills ~/.claude/skills/
cp -r evolving-skill-rules ~/.claude/skills/
cp -r splitting-skills ~/.claude/skills/
cp -r dependency-migrator ~/.claude/skills/
cp -r enterprise-knowledge ~/.claude/skills/
cp -r release-test-focus ~/.claude/skills/
cp -r designing-workflows ~/.claude/skills/
cp -r skill-architect ~/.claude/skills/
cp -r orchestrating-subagents ~/.copilot/skills/   # Copilot-targeted skill
cp -r migration-reviewer-generate ~/.claude/skills/
```

## License

MIT License

[中文文档](./README.zh-CN.md)
