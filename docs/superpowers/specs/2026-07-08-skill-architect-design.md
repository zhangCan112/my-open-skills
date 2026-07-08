# skill-architect 设计文档

- **日期：** 2026-07-08
- **状态：** 已批准设计，待实现
- **语言：** 中文（SKILL.md 内容）
- **位置：** 仓库顶层 `skill-architect/`

## 1. 背景与动机

两个参考来源都指向同一套"5 种 Skill 设计模式"：

1. Lavi Nigam《5 Agent Skill Design Patterns Every ADK Developer Should Know》—— 提出五模式（Tool Wrapper / Generator / Reviewer / Inversion / Pipeline）、决策树、模式可组合。
2. 腾讯云《我用谷歌的 5 个 skill 设计模式，把失控的 AI 调教成了特种兵》—— 中文实操版，作者据此手搓了一个名为 **skill-architect** 的元技能，唯一职责是**重构其他"屎山" Skill**：把硬编码在单个 `SKILL.md` 里的风格/颜色/HTML 规则抽到 `assets/`、`references/`，把正文减薄成流水线编排器。

本 skill 即把这套思维固化成一个可复用的架构 skill，提供三种能力：

- **提议模式**：写新 skill 时，根据意图推荐用哪种（些）模式。
- **提供模板**：给出每种模式的 `SKILL.md` 脚手架。
- **审查 / 重构**：拿现有 skill，诊断结构问题，重构成清爽的模块化架构。

## 2. 定位与边界（与现有 skill 的关系）

| Skill | 解决什么问题 | 产物 |
|---|---|---|
| `writing-skills` | skill 内容**质量**（TDD、CSO、措辞、frontmatter 规范） | 同一个 skill，写得更好 |
| `splitting-skills` | 太**大** → 拆成多个 | **多个**独立 skill |
| **`skill-architect`（本 skill）** | **结构模式**选择 + 渐进披露（`SKILL.md` 薄 + `assets/`/`references/` 外置） + 屎山→模块化重构 | **一个** skill，架构清爽 |

**依赖：** `Requires: writing-skills`（产物须遵循其 frontmatter / "Use when..." description / 结构规范）。

**关键区分：**
- 本 skill 始终产出**单个** skill，只改其**内部架构**（模式 + 渐进披露）。
- 产**多个** skill 是 `splitting-skills` 的事。
- 改**内容措辞质量**是 `writing-skills` 的事。

## 3. description / 触发条件

```yaml
name: skill-architect
description: Use when creating a new Agent Skill (deciding which structural
  pattern to use, or scaffolding from a template), OR when refactoring/reviewing
  a messy SKILL.md into a clean modular architecture. Triggers on "设计/写一个
  skill", "这个 skill 该用什么结构/模式", "重构/优化这个 skill", "skill 太乱/太长/
  屎山". Do NOT use for: general code refactoring; improving skill content quality
  (use writing-skills); or splitting one large skill into multiple separate
  skills (use splitting-skills).
```

- 第三人称，"Use when..." 开头，只写触发条件，不摘要工作流（遵循 CSO 铁律）。
- 包含中英文关键词与症状词（"屎山"、"太乱"、"重构"）。
- 显式列出 Do NOT use 以避免与 `writing-skills` / `splitting-skills` 重叠。

## 4. 五模式知识库（Tool Wrapper 知识）

| 模式 | 信号（何时用） | 用到的目录 | 复杂度 |
|---|---|---|---|
| **Tool Wrapper** | 要让 agent 成为某库/框架/领域的专家 | `references/` | 低 |
| **Generator** | 产物每次必须遵循固定模板 | `assets/` + `references/` | 中 |
| **Reviewer** | 要对照 checklist 评估、按严重度归类 findings | `references/` | 中 |
| **Inversion** | 动手前必须先分阶段问清用户 | `assets/` | 中（多轮） |
| **Pipeline** | 有顺序依赖、步骤间要校验门 | `references/` + `assets/` + `scripts/` | 高 |

**组合规则：** 模式可组合——Pipeline 可内嵌 Reviewer 步骤；Generator 可用 Inversion 收集输入；Tool Wrapper 可作为 Pipeline 内的一个 reference 文件。生产系统通常组合 2-3 种。

## 5. 元应用：本 skill 自己如何用模式（方案 A 的核心）

`skill-architect` **本身是一个 Pipeline（模式 5）**，内部示范其余四种：

- **Inversion（模式 4）** → Phase 1 收集目标 skill 的意图（一次一个问题，门控）。
- **Tool Wrapper（模式 1）** → `references/pattern-catalog.md` 是它按需加载的"库知识"。
- **Generator（模式 2）** → Phase 3 从 `assets/templates/<模式>.md` 产出脚手架。
- **Reviewer（模式 3）** → Phase 4 用 `references/refactor-checklist.md` 自检产出。

这样本 skill 同时是"教模式的参考"与"用模式的范例"，吃自己的狗粮。

## 6. 文件结构（保持 SKILL.md 薄）

```
skill-architect/
├── SKILL.md                       ← 薄的 Pipeline 编排器 + 决策树速查（始终需要）
├── references/
│   ├── pattern-catalog.md         ← 五模式详解（按需加载）
│   └── refactor-checklist.md      ← 屎山诊断 + 模块化修正清单（Phase 4 加载）
└── assets/
    └── templates/
        ├── tool-wrapper.md        ← 每种模式的 SKILL.md 脚手架（Phase 3 按选中模式加载）
        ├── generator.md
        ├── reviewer.md
        ├── inversion.md
        └── pipeline.md
```

**渐进披露约定：** 决策树是每次调用都需要的速查 → 内联在 `SKILL.md`；五模式详解、重构清单、模板都外置，到对应 phase 才加载。

## 7. Pipeline 五阶段（Phase 0–4，带门控）

```
Phase 0 模式判定 → Phase 1 意图收集(Inversion) → Phase 2 模式选择(决策树)
   → [门:用户确认模式] → Phase 3 脚手架/重构(Generator) → Phase 4 自检(Reviewer)
   → [门:用户确认交付] → 交付
```

### Phase 0：模式判定
- 判定本次是**新建** skill 还是**重构**现有 skill。
- 重构则先读目标 `SKILL.md` 及同目录全部资源（含已有 `assets/`、`references/`、`scripts/`）。

### Phase 1：意图收集（Inversion）
- 一次一个问题，多选优先。
- 新建→产物类型 / 是否需用户交互 / 是否多步 / 是否需评估。
- 重构→读后推断：现在哪里乱、违反了哪种模式、本该是哪种。
- 不拿齐关键信息不准进 Phase 2。

### Phase 2：模式选择（决策树）
- 新建→用决策树推荐最佳模式（可多选并注明组合）。
- 重构→诊断当前违反了哪种模式、应改成哪种。
- 输出：推荐模式 + 理由 + 是否组合。
- **门：** 用户确认模式选择。

### Phase 3：脚手架 / 重构（Generator）
- 新建→按 `assets/templates/<模式>.md` 填充，产出 `SKILL.md` + 需要的 `assets/`/`references/` 骨架（遵循 writing-skills 规范）。
- 重构→把硬编码规则抽到 `references/`、输出格式抽到 `assets/`、把 `SKILL.md` 减薄成编排器；保持行为等价（不擅自删功能）。
- **门：** 用户审阅产出。

### Phase 4：自检（Reviewer）
- 加载 `references/refactor-checklist.md`，逐条查：
  - description 是否会正确触发（"Use when..." + 关键词）。
  - 渐进披露是否到位（SKILL.md 薄，重型内容外置）。
  - 所选模式是否用对（目录、门控、模板齐全）。
  - 有无屎山味（全硬编码、无门控、一文件干五件事）。
- 产出 findings → 修 → 交付最终物。
- **门：** 用户确认交付。

## 8. 决策树（内联在 SKILL.md 的速查）

```
要让 agent 成为某库/领域专家?        → Tool Wrapper
产物每次必须遵循固定模板?             → Generator
要对照 checklist 评估、按严重度归类?  → Reviewer
动手前必须先问清用户?                 → Inversion
有顺序依赖、步骤间要校验门?           → Pipeline
命中多个? → 组合（见组合规则）
```

附同一信息的速查表（信号 / 模式 / 用到的目录），与第 4 节一致。

## 9. refactor-checklist.md 内容（Reviewer 知识）

| 屎山信号 | 修正动作 |
|---|---|
| 规则/约定全硬编码在 `SKILL.md` | 抽到 `references/`，按需加载 |
| 输出格式写死在正文 | 抽到 `assets/` 模板 |
| 一个文件干五件事 | 选一个主模式 + 模块化 |
| description 没有"Use when..."或太泛（不会触发） | 按 CSO 重写 description |
| 工作流没门控 | 加 Pipeline 门 |
| 全部内容每次都加载 | 渐进披露：`SKILL.md` 薄 + 重型内容外置 |
| 评估逻辑写死在正文 | 抽成 `references/` checklist（Reviewer） |

## 10. 模板规格（assets/templates/）

每个模板是一个对应模式的 `SKILL.md` 脚手架，含占位符，遵循 writing-skills 规范（frontmatter `name`+`description`，"Use when..." 开头）。要点：

- **tool-wrapper.md**：frontmatter + "Apply these conventions…" + 指向 `references/conventions.md`。
- **generator.md**：分步（加载 style guide → 加载 template → 收集缺失输入 → 填充 → 返回）。
- **reviewer.md**：review 协议（加载 checklist → 逐条评 → 按 severity 分组 → 打分 + 建议）。
- **inversion.md**：分阶段提问 + 顶部 `DO NOT start until all phases complete` 门 + 末尾加载 `assets/` 模板合成。
- **pipeline.md**：顺序步骤 + 每步门控（`Do NOT proceed until…`）+ 各步加载不同资源。

## 11. 质量约束（遵循 writing-skills）

- 所有产出 `SKILL.md` 必须有 `name`（仅字母数字连字符）+ `description`（"Use when…" 开头、第三人称、≤1024 字符）。
- description **只写触发条件，不摘要工作流**（CSO 铁律）。
- 决策点用小 flowchart，参考/模板/线性步骤不用图。
- 重构产物**不删原功能**，只改架构；行为等价。
- 关键词覆盖：包含症状词（"屎山"、"flaky"、"太长" 等）便于发现。

## 12. 验收标准（Definition of Done）

- [ ] `skill-architect/SKILL.md` 是薄的 Pipeline 编排器，含决策树速查与五阶段（Phase 0–4）门控。
- [ ] `references/pattern-catalog.md` 含五模式详解 + 组合规则。
- [ ] `references/refactor-checklist.md` 含屎山信号→修正表。
- [ ] `assets/templates/` 五个模板齐全且遵循 writing-skills 规范。
- [ ] 本 skill 的 description 触发正确、与 writing-skills/splitting-skills 边界清晰。
- [ ] 自测：能用本 skill 跑通一次"新建"和一次"重构"。
- [ ] README.md 与 README.zh-CN.md 登记 skill-architect。

## 13. 不做（YAGNI）

- 不产**多个** skill（归 splitting-skills）。
- 不做 skill 内容措辞的质量审查（归 writing-skills）。
- 不内置可执行脚本（`scripts/`）——本 skill 是纯文档编排。
- 不绑定特定 agent 运行时（ADK SkillToolset 等）；保持 agentskills.io 通用。
