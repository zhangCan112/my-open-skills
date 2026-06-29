# my-open-skills

个人收集和维护的 AI Agent Skills。

## Skills

| Skill | 说明 | 详细文档 |
|-------|------|----------|
| [writing-skills](./writing-skills/) | Skill 编写指南 — 帮助创建、编辑和验证高质量的 AI Agent Skills | [README](./writing-skills/README.md) |
| [evolving-skill-rules](./evolving-skill-rules/) | Skill 规则演进 — 从失败案例中提取可泛化的规则 | [SKILL.md](./evolving-skill-rules/SKILL.md) |
| [splitting-skills](./splitting-skills/) | 将大型 skill 或结构化知识分解为多个独立、可复用的 Agent Skills | [SKILL.md](./splitting-skills/SKILL.md) |
| [dependency-migrator](./dependency-migrator/) | 依赖迁移模板 — 通过用户维护的规则库（pattern + solution）进行代码依赖/API 迁移 | [README](./dependency-migrator/README.md) |
| [enterprise-knowledge](./enterprise-knowledge/) | 企业知识库 — 查询企业内部代码与框架知识，并带引导式添加模式录入新知识（trigger + detail） | [README](./enterprise-knowledge/README.md) |
| [release-test-focus](./release-test-focus/) | 发布测试简报 — 把主项目与依赖库的 ticket 汇编成面向测试的简报（必测重点 + 回归范围） | [README](./release-test-focus/README.md) |

## Plugins

| Plugin | 说明 | 详细文档 |
|--------|------|----------|
| [skill-tracker](./plugins/skill-tracker/) | OpenCode 插件 — 实时监控、记录和可视化 skill 工具的调用 | [README](./plugins/skill-tracker/README.md) |

## 安装

将需要的 Skill 文件夹复制到对应 AI 工具的 skills 目录即可。例如 Claude Code：

```bash
cp -r writing-skills ~/.claude/skills/
cp -r evolving-skill-rules ~/.claude/skills/
cp -r splitting-skills ~/.claude/skills/
cp -r dependency-migrator ~/.claude/skills/
cp -r enterprise-knowledge ~/.claude/skills/
cp -r release-test-focus ~/.claude/skills/
```

## 许可证

MIT License

[English](./README.md)
