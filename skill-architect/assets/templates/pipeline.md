---
name: <skill-name>
description: Use when the user asks to <目标动作> that requires ordered multi-step execution with validation between steps. Do NOT use for <反例>.
metadata:
  pattern: pipeline
  steps: "4"
---

# <Skill Name>

## 概述
你在跑一个 <目标> 流水线。按序执行每步。**不准跳步；某步失败就不准继续。**

Pipeline 有两种门，按步骤性质选用：
- **人检门**：该步产物需要人判断（口味、范围、取舍）→ 让用户确认
- **自检门**：该步产物能对照客观标准判对错 → 加载 checklist 自查，过了就进；不过就在步内修到过

## Step 1 —— <阶段 1>（常无外部资源，纯分析输入）
分析用户输入，产出 <中间物 1，如 inventory / 清单>。呈现给用户。
> 人检门：Do NOT proceed to Step 2 until the user confirms <具体要确认的点>（用户确认前不准进）。

## Step 2 —— <阶段 2>
加载 `references/<规则>.md` 取 <规则>。按规则产出 <中间物 2>，逐个呈现。
> 人检门：Do NOT proceed to Step 3 until the user confirms <中间物 2>。

## Step 3 —— <阶段 3>
加载 `assets/<文件>-template.md` 取输出结构。汇编成 <最终物草案>。

## Step 4 —— 质检（本步是内嵌的 Reviewer）
加载 `references/quality-checklist.md`，逐条对照 <最终物草案>：<检查项>。
> 自检门：有问题就**在当前步内修**（不退回、不整步重来），修到全部通过再呈现最终物。
