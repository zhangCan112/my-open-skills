# 五模式详解（pattern-catalog）

本文件是 skill-architect 的 Tool Wrapper 知识库。Phase 2 选模式、Phase 3 出脚手架时按需加载。

## 五模式的定义性轴线（各模式靠什么立身）

每个模式除 `pattern` 自标识外，还在 `metadata` 里挂**一条定义性维度**——这条维度就是该模式区别于其他模式的本质：

| 模式 | 定义性轴线 | metadata 字段示例 | 说明 |
|---|---|---|---|
| Tool Wrapper | **领域** | `domain: fastapi` | 靠"成为某领域的专家"立身 |
| Generator | **输出格式** | `output-format: markdown` | 靠"产出固定结构的某格式产物"立身 |
| Reviewer | **严重度分级** | `severity-levels: error,warning,info` | 靠"按严重度归类 findings"立身 |
| Inversion | **多轮交互** | `interaction: multi-turn` | 靠"多轮访谈后才动手"立身 |
| Pipeline | **步骤编排** | `steps: "4"` | 靠"顺序步骤 + 门控"立身 |

选模式时问自己：这个 skill 的主人轴是哪个？写 skill 时把这条轴线挂进 `metadata`，既固化心智模型，也方便工具/人识别。

## 模式 1：Tool Wrapper —— 教 agent 一个库/框架

**何时用：** 要让 agent 成为某库、框架、内部系统的专家，按需套用其约定。最简单、最常见。

**用到的目录：** `references/`（放详细约定）。

**骨架要点：**
- description 只写触发（含具体库名关键词如 FastAPI / Pydantic / React），**不摘要"做什么"**——别写 "Apply best practices on demand"，那是正文的事。
- **双协议分裂**是本模式的骨架特征：评审流 / 写作流 各一套，分别建模。
- 评审流：加载约定 → 逐条对照 → 每个违规 cite 规则 + 给修正 → **同时表扬遵循最佳实践的代码**（不只挑错，正反馈同样塑造产出姿态）。
- 写作流：加载约定 → 严格遵循 → 可额外挂几条"无论如何都要做"的硬指令（如"所有函数签名加类型注解"），独立于约定清单。
- `references/conventions.md` 要**按关切分类组织**（如 路由定义 / 模型 / 错误处理 / 异步 / 依赖 / 安全），不是扁平规则表。

**最小示例（SKILL.md 片段）：**

```yaml
---
name: api-expert
description: Use when building, reviewing, or debugging FastAPI applications, REST APIs, or Pydantic models.
metadata:
  pattern: tool-wrapper
  domain: fastapi
---
```

**门控：** 无（最简单，无多步）。

## 模式 2：Generator —— 产出固定结构

**何时用：** 产物每次都要遵循同一模板（报告、API 文档、commit message、脚手架）。一致性 > 创造性。

**用到的目录：** `assets/`（输出模板）+ `references/`（style guide / 质量规则）。

**骨架要点：**
- **核心不变量（正文 MUST 喊出来）：模板里每个 section 必须在产出中出现**，一个都不能丢。这是 Generator 的命根子。
- 分步编排：加载 style guide → 加载 template → 补缺失输入 → 填模板 → 单文档返回。
- 补输入是**两步逻辑**：①从模板反推需要哪些输入 → ②只问用户**尚未提供**的（别把已给的再问一遍）。
- SKILL.md 是固定编排器；template / style-guide 是**可替换插件**——换模板即换产出，正文不改。

**门控：** 可在"补缺失输入"处加一问一答。

## 模式 3：Reviewer —— 对照 checklist 评估

**何时用：** 要对代码/内容按 checklist 评估、按严重度（error/warning/info）归类 findings。把 WHAT 查（checklist 文件）与 HOW 查（评审协议）分开——换 checklist 即换评审。

**用到的目录：** `references/`（checklist）。

**骨架要点：**
- 协议：加载 checklist → 读代码理解意图 → 逐条评 → 每个违规给 行号+严重度+原因+修正 → 产出 Summary / Findings（按严重度）/ Score / Top3 建议。
- `references/review-checklist.md` 要是**"类别 × 严重度"二维结构**：按关切分类（正确性 / 风格 / 文档 / 安全 / 性能…），每类**预指派严重度**（正确性→error、风格→warning…）。不是扁平规则表。

**门控：** 无；产出即止。

## 模式 4：Inversion —— skill 先采访你

**何时用：** agent 动手前必须先从用户拿上下文（需求采集、诊断问诊、配置向导）。防止"基于假设直接生成"。

**用到的目录：** `assets/`（合成阶段用的输出模板）。

**骨架要点：**
- 分阶段提问，每阶段问完才进下一个。**一次一题、等答；按序问、Do not skip any**（防 agent 自判某题多余而跳过）。
- 顶部必须写 `DO NOT start building/designing until all phases are complete`——关键门，没它 agent 会第一个答案后就跳结论。
- 全部答完才加载模板合成。合成后还有**结束门**：问"这准确反映你的需求吗？要改什么？"，迭代到用户确认才算完——不是合成完就完。

**门控：** 阶段门 + 顶部总门 + 合成后的结束确认门。

## 模式 5：Pipeline —— 强制多步工作流

**何时用：** 有顺序依赖、步骤间要校验门。最复杂；可用上全部三种目录 + 步骤间控制流。

**用到的目录：** `references/` + `assets/` + `scripts/`（若有可执行脚本）。

**骨架要点：**
- 每步**产出具体中间物**，门验证的就是这个中间物（不是泛泛确认）。Pipeline 的心跳 = 产出中间物 → 门验它。
- 门有两种，按步骤性质选：
  - **人检门**：产物要人判断（口味 / 范围 / 取舍）→ `Do NOT proceed to Step N until the user confirms…`
  - **自检门**：产物能对照客观标准判对错 → 加载 checklist 自查，过了进；不过在**当前步内修**（不退回、不整步重来），修到过再进。
- 每步按需加载不同资源，省 context。Step 1 常无外部资源（纯分析输入），后续步才加载。
- 某步若要做"对照 checklist 评估"，那步本质是**内嵌的 Reviewer**（Pipeline + Reviewer 组合）。

**门控：** 人检门 / 自检门 按步骤选用，机检优先。

## 组合规则

模式可组合，生产系统通常组合 2-3 种：

- **Pipeline + Reviewer**：Pipeline 的某步内嵌一个 Reviewer（加载 checklist 评估）。例：doc-pipeline 的 Step 4 是质量评审。
- **Generator + Inversion**：Generator 先用 Inversion 收集输入，再填模板。
- **Pipeline + Inversion + Generator + Reviewer**：本 skill skill-architect 就是这个组合。
- **Tool Wrapper 作 reference**：Tool Wrapper 的约定文件可作为 Pipeline 内某步的 reference。

**选择优先级：** 单步能搞定 → 别套 Pipeline。先最简，证明有收益才加复杂度。
