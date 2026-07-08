---
name: changelog-generator
description: Use when the user asks to write/create/draft a CHANGELOG.md entry from a list of merged pull requests, or needs a changelog entry in the Keep-a-Changelog format every time. Do NOT use for release-note prose summaries, raw git commit logs, or freeform narrative release announcements.
metadata:
  pattern: generator
  output-format: markdown
---

# Changelog Generator

## 概述
按固定的 Keep-a-Changelog 模板，把一组已合并的 Pull Request 产出一个 CHANGELOG.md 条目。一致性优先——相同的 PR 输入，每次产出的结构、语气、粒度完全一致。

## 核心不变量
**模板里的 Added / Changed / Fixed / Removed 四个 section 必须在产出中全部出现，一个都不能丢——即使某 section 本期无条目，也必须保留该 section 标题并在其下填写 `_None this release_`。这是本 skill 的命根子。**

## 步骤（严格按序）
1. 加载 `references/style-guide.md` 取语气（祈使句 imperative mood）/格式/质量规则，以及"每条目对应一个 PR（entry-per-PR granularity）"的粒度规则
2. 加载 `assets/changelog-template.md` 取输出结构（含 Added / Changed / Fixed / Removed 四个 section 的固定骨架）
3. **补缺失输入（两步）**：① 从模板反推需要哪些输入——release 版本号/日期标识、以及待分类的已合并 PR 列表（每个 PR 的标题、编号、类型/标签）→ ② 只问用户**尚未提供**的（一次一问；若用户已给出 PR 列表与版本号，不得重复追问）
4. 按 style guide 填模板——把每个 PR 归入 Added / Changed / Fixed / Removed 之一，写成祈使句、每 PR 一条目；**四个 section 都要有内容**：有条目的写条目，无条目的写 `_None this release_`
5. 以单个 markdown 文档返回成品（一段可直贴进 CHANGELOG.md 的条目）

## 通过条件
- Added / Changed / Fixed / Removed 四个 section 齐全（核心不变量）
- 空 section 仍保留标题且填 `_None this release_`
- 所有条目为祈使句、每 PR 恰好一条目（entry-per-PR）
- 版本号/日期 header 出现
- 符合 `references/style-guide.md`
