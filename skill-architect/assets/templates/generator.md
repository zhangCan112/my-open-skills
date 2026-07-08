---
name: <skill-name>
description: Use when the user asks to write/create/draft a <产物类型>, or needs <产物类型> in a consistent fixed structure every time. Do NOT use for <反例>.
metadata:
  pattern: generator
  output-format: <markdown|yaml|json|...>
---

# <Skill Name>

## 概述
按固定模板产出 <产物类型>。一致性优先。

## 核心不变量
**模板里每个 section 必须在产出中出现，一个都不能丢。**

## 步骤（严格按序）
1. 加载 `references/style-guide.md` 取语气/格式/质量规则
2. 加载 `assets/<产物>-template.md` 取输出结构
3. **补缺失输入（两步）**：① 从模板反推需要哪些输入 → ② 只问用户**尚未提供**的（一次一问）
4. 按 style guide 填模板——每个 section 都要有内容
5. 以单个文档返回成品

## 通过条件
- 模板所有 section 齐全（核心不变量）
- 符合 style guide
