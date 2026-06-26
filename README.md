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
```

## License

MIT License

[中文文档](./README.zh-CN.md)
