# Design: designing-workflows

**日期：** 2026-07-01
**状态：** 已确认，已实现

## 目标

一个 skill：当用户想"用 AI 做某事"时，把目标编排成一份**能盲跑、可复用、真封装**的分层 playbook；同时主动识别并填平缺失的知识/上下文。

## 为什么需要它（要解决的问题）

观察到的两类失败：

1. **"万物皆 skill"**：把该是 workflow 的固定流程、或该是 tool 的确定性操作都塞进 SKILL.md，导致 skill 越做越复杂、藏了一堆别人看不见的细节（God Object 反模式）。
2. **编排凭印象**：agent 不主动盘点手上有什么能力、不识别缺口，凭印象编 workflow，执行时才发现缺这少那。

## 关键设计决策（含被否决的方案）

### 决策 1：产物是 playbook，不是新 skill

- 选项：(A) 生成新 SKILL.md / (B) 生成可复用 playbook 文档 / (C) 两者都支持
- **选 B。** 避免与 `writing-skills` 竞争；playbook 是"程序"，skill 是"库"，二者职责不同。

### 决策 2：形态 = skill，内部编码设计原则（Approach B）

脑暴时分叉：
- 岔路 A：一套"能力设计原则"参考文档
- 岔路 B：一个会帮你产出 playbook 的 skill，内部遵循 A 的原则
- **选 B。** 把原则编码进 skill 的流程里，让 skill 替用户做（而非只给人读）。

### 决策 3：分层判据 = 复用度 + 目标特异性（修正了第一版错误）

第一版错误地用"有没有判断"区分 skill/workflow。**修正**：workflow 本身是 prompt，也能含判断。正确判据：

| 层 | 判据 | 类比 |
|---|---|---|
| Tool | 原子、确定性、无判断 | 系统调用 |
| Skill | 高复用 + 领域专长 + 低目标特异性 | 库 |
| Workflow | 目标特异 + 编排若干能力 | 程序 |

### 决策 4：真封装 = 物理拆分 + 懒加载（非单文件排版）

用户挑战："全在一个页面被一次读进来，分层有何意义？" —— 成立。单文件里的 L0–L3 只是视觉排版。**真封装必须**：稳定接口 + 可替换实现 + 按需加载。落地为**目录结构**（flow.md 入口 + steps/ 按需 + gaps.md），低于规模阈值才退化单文件。这复刻了仓库里 `enterprise-knowledge`、`writing-skills` 已有的"概览 + 按需加载"模式。

### 决策 5：方法论 = 以终为始

作用在两层：
- 外层（设计 skill）：先钉死产物 + 消费模型，再倒推流程。
- 内层（skill 运行时）：Phase 0 先定义"做完"（成功标准/约束/消费模式），再设计步骤。

关键重排：**缺口初扫排在能力盘点之前**——"还差什么"比"手上有什么"更能暴露问题。

### 决策 6：能力盘点 = 已安装 + 可选扫描目录

先盘点当前会话可访问的 skill + 原生工具；若用户指定目录则额外扫描其 SKILL.md。

### 决策 7：消费模式默认 agent 跑

step 含可执行 prompt + 机检 gate，人只在关键 gate 介入。

## Definition of Done（契约）

> 任意的 agent 拿到这份 playbook，能按 phase 逐步正确执行——每个 phase 只加载它那一个 step 文件，中途不需要再回来问设计问题。

## 六阶段流程

0. 定义终点（成功标准/约束/消费模式）— 门：用户确认
1. 缺口初扫（朝终点看，暴露未知）
2. 能力盘点（已安装 + 可选扫目录 → 能力池）
3. 倒推分解（从终点反推 phase/step，每步标 tool/skill/inline，选编排模式）— 门：用户确认
4. 分层装配（目录 or 单文件）
5. 缺口访谈（逐条问、一次一个，填平缺口）
6. 产出 + 自检（按 DoD 逐条验）

## 与现有 skill 的边界

| skill | 产物 | 区别 |
|---|---|---|
| brainstorming | 设计 spec | 非能力盘点驱动 |
| writing-plans | 代码实现 plan | 面向代码任务 |
| **designing-workflows** | 能力编排 playbook | 能力盘点驱动 |

## 交付物

- `designing-workflows/SKILL.md`（中文正文，英文 frontmatter）
- `designing-workflows/playbook-template.md`（按需加载的产物模板）

## 待办：测试

按 `writing-skills` 铁律，本 skill 应做基线 TDD（无 skill 时 agent 编 workflow 会犯的错 → 装上 skill 后是否纠正）。已识别的失败模式作为测试基线：god object 平铺、跨层误分类、跳过缺口、过度编排、引用不存在的能力。
