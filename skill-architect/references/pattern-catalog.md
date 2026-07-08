# 五模式详解（pattern-catalog）

本文件是 skill-architect 的 Tool Wrapper 知识库。Phase 2 选模式、Phase 3 出脚手架时按需加载。

## 模式 1：Tool Wrapper —— 教 agent 一个库/框架

**何时用：** 要让 agent 成为某库、框架、内部系统的专家，按需套用其约定。最简单、最常见。

**用到的目录：** `references/`（放详细约定）。

**骨架要点：**
- description 含具体库名关键词（"FastAPI"、"Pydantic"、"React"），别写"帮你搞 API"这种泛话。
- 正文：`Apply these conventions…`，指向 `references/conventions.md`。
- 评审代码时：加载约定 → 逐条对照 → 每个违规 cite 规则 + 给修正。
- 写代码时：加载约定 → 严格遵循。

**最小示例（SKILL.md 片段）：**

```yaml
---
name: api-expert
description: Use when building, reviewing, or debugging FastAPI applications, REST APIs, or Pydantic models. Apply FastAPI best practices on demand.
---
```

```markdown
你是 FastAPI 专家。评审/写代码时加载 `references/conventions.md` 并逐条套用。
```

**门控：** 无（最简单，无多步）。

## 模式 2：Generator —— 产出固定结构

**何时用：** 产物每次都要遵循同一模板（报告、API 文档、commit message、脚手架）。一致性 > 创造性。

**用到的目录：** `assets/`（输出模板）+ `references/`（style guide / 质量规则）。

**骨架要点：**
- 分步编排：加载 style guide → 加载 template → 收集缺失输入 → 填模板 → 返回。
- 模板定义必有的 section；style guide 定义语气/格式/质量。
- 换 template 或 style guide 即换产出，正文不用改。

**门控：** 可在"收集缺失输入"处加一问一答。

## 模式 3：Reviewer —— 对照 checklist 评估

**何时用：** 要对代码/内容按 checklist 评估、按严重度（error/warning/info）归类 findings。把 WHAT 查（checklist 文件）与 HOW 查（评审协议）分开——换 checklist 即换评审。

**用到的目录：** `references/`（checklist）。

**骨架要点：**
- 协议：加载 checklist → 读代码理解意图 → 逐条评 → 每个违规给 行号+严重度+原因+修正 → 产出 Summary / Findings（按严重度）/ Score / Top3 建议。

**门控：** 无；产出即止。

## 模式 4：Inversion —— skill 先采访你

**何时用：** agent 动手前必须先从用户拿上下文（需求采集、诊断问诊、配置向导）。防止"基于假设直接生成"。

**用到的目录：** `assets/`（合成阶段用的输出模板）。

**骨架要点：**
- 分阶段提问，每阶段问完才进下一个。
- 顶部必须写 `DO NOT start building/designing until all phases are complete`——这是关键门，没它 agent 会第一个答案后就跳结论。
- 全部答完才加载模板合成。

**门控：** 阶段门 + 顶部总门。

## 模式 5：Pipeline —— 强制多步工作流

**何时用：** 有顺序依赖、步骤间要校验门。最复杂；可用上全部三种目录 + 步骤间控制流。

**用到的目录：** `references/` + `assets/` + `scripts/`（若有可执行脚本）。

**骨架要点：**
- 每步必须完成才能进下一步。
- 门条件是定义性特征：`Do NOT proceed to Step N until the user confirms`、`Do NOT skip steps or proceed if a step fails`。
- 每步按需加载不同资源，省 context。

**门控：** 步骤间校验门（机检优先，需人判断处留人检）。

## 组合规则

模式可组合，生产系统通常组合 2-3 种：

- **Pipeline + Reviewer**：Pipeline 的某步内嵌一个 Reviewer（加载 checklist 评估）。例：doc-pipeline 的 Step 4 是质量评审。
- **Generator + Inversion**：Generator 先用 Inversion 收集输入，再填模板。
- **Pipeline + Inversion + Generator + Reviewer**：本 skill skill-architect 就是这个组合。
- **Tool Wrapper 作 reference**：Tool Wrapper 的约定文件可作为 Pipeline 内某步的 reference。

**选择优先级：** 单步能搞定 → 别套 Pipeline。先最简，证明有收益才加复杂度。
