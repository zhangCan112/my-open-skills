# my-open-skills

个人收集和维护的 AI Agent Skills。

## Skills

| Skill | 说明 | 详细文档 |
|-------|------|----------|
| [writing-skills](./writing-skills/) | Skill 编写指南 — 帮助创建、编辑和验证高质量的 AI Agent Skills | [README](./writing-skills/README.md) |
| [evolving-skill-rules](./evolving-skill-rules/) | Skill 规则演进 — 从失败案例中提取可泛化的规则 | [SKILL.md](./evolving-skill-rules/SKILL.md) |
| [splitting-skills](./splitting-skills/) | 将大型 skill 或结构化知识分解为多个独立、可复用的 Agent Skills | [SKILL.md](./splitting-skills/SKILL.md) |
## 安装

将需要的 Skill 文件夹复制到对应 AI 工具的 skills 目录即可。例如 Claude Code：

```bash
cp -r writing-skills ~/.claude/skills/
cp -r evolving-skill-rules ~/.claude/skills/
cp -r splitting-skills ~/.claude/skills/
```

## 许可证

MIT License

[English](./README.md)
