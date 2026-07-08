# 重构自检清单（refactor-checklist）

Phase 4 加载。既是"屎山诊断"清单，也是重构后的验收清单。

## 屎山信号 → 修正

| 屎山信号 | 修正动作 |
|---|---|
| 规则/约定全硬编码在 `SKILL.md` 正文 | 抽到 `references/`，按需加载 |
| 输出格式写死在正文 | 抽到 `assets/` 模板 |
| 评估/检查逻辑写死在正文 | 抽成 `references/` checklist（→ Reviewer 模式） |
| 一个文件干五件事 | 选一个主模式 + 模块化；确属多职责才考虑 splitting-skills |
| description 没有"Use when..."或太泛 | 按 CSO 重写：只写触发条件 + 症状关键词，不摘要工作流 |
| description 摘要了工作流 | 删掉流程描述，只留"何时该用" |
| 工作流没门控 | 顺序步骤间加 `Do NOT proceed until…` 门（→ Pipeline） |
| 全部内容每次都加载 | 渐进披露：SKILL.md 薄，重型内容外置 references/assets |
| 该用 Pipeline 却顺序乱 | 把步骤重排为顺序 + 门 |
| 该单步却套了流水线 | 删多余编排，回归最简 |
| frontmatter 缺 name 或 description | 补全；name 仅字母数字连字符；description ≤1024 字符 |

## 自检协议

1. 读重构后的 `SKILL.md` 与全部资源，确认**原功能都在**（行为等价，没删功能）。
2. 逐条对照上表，标记每个信号是 ✅ 已修正 / ❌ 未修正。
3. 验证 description：模拟几个真实用户提问，判断该 skill 会不会被正确触发。
4. 验证渐进披露：SKILL.md 是否够薄？重型内容是否都外置？
5. 验证模式一致性：选定的模式用对了目录和门控吗？
6. 有 ❌ → 回 Phase 3 修，再回本清单。

## 通过条件

- 上表全部 ✅
- 原功能无丢失
- description 触发测试通过
- 模式目录与门控齐备
