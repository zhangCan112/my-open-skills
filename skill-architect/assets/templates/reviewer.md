---
name: <skill-name>
description: Use when the user submits <对象> for review, asks for feedback on <对象>, or wants a <对象> audited against a checklist. Do NOT use for <反例>.
metadata:
  pattern: reviewer
  severity-levels: error,warning,info
---

# <Skill Name>

## 概述
对照 checklist 评估 <对象>，按严重度归类 findings。

## 评审协议（严格按序）
1. 加载 `references/review-checklist.md` 取评审标准
2. 先读懂 <对象> 的意图，再评
3. 逐条套用 checklist，每个违规给：
   - 行号 / 位置
   - 严重度：error（必修）/ warning（应修）/ info（可考虑）
   - 为什么错（不只说错在哪）
   - 具体修正（带改后代码）
4. 产出结构化评审：
   - **Summary**：做什么的、整体质量
   - **Findings**：按严重度分组（error → warning → info）
   - **Score**：1–10 + 简述
   - **Top 3 建议**：最有价值的改进

## review-checklist.md 怎么写
按**"类别 × 严重度"二维**组织：按关切分类（正确性 / 风格 / 文档 / 安全 / 性能…），每类预指派严重度。不是扁平规则表。

## 换评审标准
换 `references/review-checklist.md` 即换评审，正文不用改。
