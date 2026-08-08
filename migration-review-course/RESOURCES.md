# 代码迁移 review 资源

## 知识（Knowledge）

### 方法论 / Playbook（优先读）

- [CoreStory: Behavioral Verification Playbook](https://docs.corestory.ai/playbooks/modernization/behavioral-verification)
  最系统化的"前后对比找遗漏"方法论。五步流程 + 四层验证梯队 + Behavioral Equivalence Report 模板。**用于**：作为整套课程的主线教材。
- [CoreStory: Business Rules Extraction](https://docs.corestory.ai/playbooks/business-rules-extraction)
  从旧代码提取业务规则清单（Phase 2）的方法。**用于**：理解"先建规则清单，再逐规则验证"的前提。

### 现成 Skill / Agent（可直接借鉴的做法）

- [parity-check agent — helderberto/agent-skills](https://github.com/helderberto/agent-skills/blob/main/agents/parity-check.md)
  "枚举源端每个行为（分支/守卫/错误路径/i18n）→ 目标端同样映射 → 分类 MISSING/PARTIAL/DIFFERS"。**用于**：课程第 2 课的行为枚举法核心。
- [Microsoft: validate-migration-parity skill](https://skillsmp.com/skills/microsoft-aitour26-wrk541-real-world-code-migration-with-github-copilot-agent-mode-github-skills-validate-migration-parity-skill-md)
  验证 Python API 与 C# 重写之间的 parity（pytest、endpoint 对比、回归）。**用于**：跨语言重写的具体验证样例。
- [migration-validator skill — a5c-ai](https://mcpmarket.com/tools/skills/migration-validator)
  并行执行 + 逐字段 diff API 响应 + 验收标准映射。**用于**：工具化对比的实现参考。
- [migration-refactoring skill — d-o-hub](https://skillsmp.com/creators/d-o-hub/github-template-ai-agents/agents-skills-migration-refactoring)
  含 breaking-change 分析清单、快照测试、属性测试（property-based）、迁移模式（strangler fig 等）。**用于**：课程第 5 课动态验证的补充。
- [sub-equivalence-verification — dungnotnull/legacy-code-migration-agent-skill](https://github.com/dungnotnull/legacy-code-migration-agent-skill)
  如何设计"行为 oracle"（characterization tests、golden-master、differential testing、数值容差）。**用于**：理解"为什么没有 oracle 就无法证明迁移正确"。

### 论文 / 深度阅读

- [ModernizeSpec: Parity Testing](https://modernizespec.dev/techniques/parity-testing)
  characterization tests、表驱动 parity、golden files、置信度评分。**用于**：第 5 课动态验证的细节。
- [GitHub Next: Crane — verified code migration](https://githubnext.com/posts/crane/)
  "迁移进步必须可验证地推进"：migration_score = correctness_gate × progress。**用于**：理解"验证是迁移的棘轮"，第 5 课补充。

### 经典书籍

- [Working Effectively with Legacy Code — Michael Feathers](https://www.oreilly.com/library/view/working-effectively-with/0131177052/)
  characterization test / golden master 概念的源头。**用于**：第 5 课"旧系统行为就是规格"这一思想依据。

## 智慧（社区）

- 暂无高信任社区被确认。候选（待用户确认是否加入）：
  - [r/ExperiencedDevs](https://www.reddit.com/r/ExperiencedDevs/) — 迁移经验类讨论的成熟社区
  - [r/Programming](https://www.reddit.com/r/programming/) — 迁移/重构方法论文常被讨论

## 缺口（Gaps）

- 没有找到"迁移 review 专用"的高质量中文社区内容；中文资源以工具介绍为主，方法论多来自英文社区。
- "业务规则清单"（Business Rules Inventory）目前主要依赖 CoreStory 一家，缺少中立第三方对同一主题的阐述。
