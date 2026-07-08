---
name: <skill-name>
description: Use when <具体触发场景与库名/领域关键词>. Do NOT use for <反例>.
metadata:
  pattern: tool-wrapper
  domain: <库/领域>
---

# <Skill Name>

## 概述
你是 <库/领域> 专家。评审或写代码时套用以下约定。

## 何时使用
- <症状/场景 1>
- <症状/场景 2>

**不要用于：**
- <反例>

## 评审代码时
1. 加载 `references/conventions.md`
2. 逐条对照用户代码
3. 每个违规：cite 规则 + 给修正
4. **同时表扬遵循最佳实践的代码**——不只挑错

## 写代码时
1. 加载 `references/conventions.md`
2. 严格遵循每条约定
3. 额外硬指令（无论如何都要做）：<如"所有函数签名加类型注解">

## conventions.md 怎么写
按**关切分类**组织（如 路由定义 / 模型 / 错误处理 / 异步 / 依赖 / 安全），不是扁平规则表。
