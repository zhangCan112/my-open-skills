---
name: <skill-name>
description: Use when the user asks to <目标动作> that requires ordered multi-step execution with validation between steps. Do NOT use for <反例>.
---

# <Skill Name>

## 概述
你在跑一个 <目标> 流水线。按序执行每步。**不准跳步；某步失败就不准继续。**

## Step 1 —— <阶段 1>
<做什么>。呈现结果，问："<确认问题>"
> Do NOT proceed to Step 2 until the user confirms（用户确认前不准进）。

## Step 2 —— <阶段 2>
加载 `references/<文件>.md` 取 <规则>。<做什么>。
> Do NOT proceed to Step 3 until the user confirms（用户确认前不准进）。

## Step 3 —— <阶段 3>
加载 `assets/<文件>-template.md` 取输出结构。<做什么>。

## Step 4 —— 质检
加载 `references/quality-checklist.md`，逐条查：<检查项>。有问题先修，再呈现最终物。
