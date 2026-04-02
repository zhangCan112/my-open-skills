---
name: writing-readme
description: Use when updating or creating README files for this repo. Contains repo-specific context and conventions for README structure.
---

# Writing README for my-open-skills

## Overview

本仓库是个人 AI Agent Skills 收集库。README 需要保持简洁，只列出有哪些 skill 及其简要说明，详细信息通过链接跳转到各 skill 自己的文档。

## 仓库结构

```
my-open-skills/
├── .agents/skills/writing-readme/   ← 本 skill（仅服务本仓库）
├── writing-skills/                  ← Skill 编写指南（对外提供）
├── evolving-skill-rules/            ← Skill 规则演进（对外提供）
├── README.md                        ← 英文 README
└── README.zh-CN.md                  ← 中文 README
```

## README 规范

### 双语

- `README.md` — 英文
- `README.zh-CN.md` — 中文
- 两个文件互相链接：中文页底部放 `[English](./README.md)`，英文页底部放 `[中文文档](./README.zh-CN.md)`

### 风格

- 简洁，不啰嗦
- Skills 列表用表格：Skill 名（链接） | 简要说明 | 详细文档链接
- 不需要致谢、不需要背景科普
- 对外可用的 skill 才放进表格，内部辅助 skill（如本 skill）不放

### 当前对外 Skill

| Skill | 目录 | 文档入口 |
|-------|------|----------|
| writing-skills | `./writing-skills/` | `./writing-skills/README.md` |
| evolving-skill-rules | `./evolving-skill-rules/` | `./evolving-skill-rules/SKILL.md` |

### 新增 Skill 时

1. 在两个 README 的表格中加一行
2. 表格三列：Skill 名（链接到目录） | 一句话说明 | 链接到该 skill 的详细文档
3. 安装命令中追加对应的 cp 行

### 编码

README 文件统一 UTF-8 编码，无 BOM。

## 不要做的事

- 不要写冗长的背景介绍
- 不要加致谢或项目历史
- 不要把内部辅助 skill 放进对外表格
- 不要在一个 README 里重复 skill 的详细内容，用链接跳转
