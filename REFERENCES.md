# 代码迁移 review 工作 — 引用来源汇总

> 用于在另一个对话中对该工作做 review。汇总：外部链接 + 本地引用文件 + 本会话加载的 skills。

## A. 外部方法论来源（教程与 skill 的素材）

来自 `migration-review-course/RESOURCES.md`，并用在课程各课与 `migration-reviewer-generate` / `migration-reviewer-audit` 的六片方法论中。

### 优先读（主线教材）

- [CoreStory: Behavioral Verification Playbook](https://docs.corestory.ai/playbooks/modernization/behavioral-verification)
  五步流程 + 四层验证梯队 + Behavioral Equivalence Report 模板。整套课程主干；`methodology.md` 的"验证梯队""等价报告"直接来自它。
- [CoreStory: Business Rules Extraction](https://docs.corestory.ai/playbooks/business-rules-extraction)
  从旧代码提取业务规则清单。"先建规则清单，再逐条验证"前提。`Business Rules Inventory` 一节来源。

### 现成 Skill / Agent（借鉴的做法）

- [parity-check agent — helderberto/agent-skills](https://github.com/helderberto/agent-skills/blob/main/agents/parity-check.md)
  枚举源端行为（分支/守卫/错误路径/i18n）→ 目标端映射 → 分类 MISSING/PARTIAL/DIFFERS。课程第 2 课行为枚举法 + 差异三分类的来源。
- [Microsoft: validate-migration-parity skill — skillsmp.com](https://skillsmp.com/skills/microsoft-aitour26-wrk541-real-world-code-migration-with-github-copilot-agent-mode-github-skills-validate-migration-parity-skill-md)
  跨语言重写 parity 验证样例（pytest、endpoint 对比、回归）。
- [migration-validator skill — a5c-ai (mcpmarket)](https://mcpmarket.com/tools/skills/migration-validator)
  并行执行 + 逐字段 diff API 响应 + 验收标准映射。
- [migration-refactoring skill — d-o-hub (skillsmp)](https://skillsmp.com/creators/d-o-hub/github-template-ai-agents/agents-skills-migration-refactoring)
  breaking-change 分析、快照测试、property-based 测试、strangler fig 迁移模式。第 5 课动态验证补充。
- [sub-equivalence-verification — dungnotnull/legacy-code-migration-agent-skill](https://github.com/dungnotnull/legacy-code-migration-agent-skill)
  行为 oracle 设计（characterization tests、golden-master、differential testing、数值容差）。"没有 oracle 无法证明正确"的思想来源。

### 论文 / 深度阅读

- [ModernizeSpec: Parity Testing](https://modernizespec.dev/techniques/parity-testing)
  characterization tests、表驱动 parity、golden files、置信度评分。Golden master 验证的经验来源。
- [GitHub Next: Crane — verified code migration](https://githubnext.com/posts/crane/)
  "迁移必须可验证地推进"，migration_score = correctness gate × progress。"验证是迁移的棘轮"。

### 经典书籍

- [Working Effectively with Legacy Code — Michael Feathers](https://www.oreilly.com/library/view/working-effectively-with/0131177052/)
  characterization test / golden master 概念源头。"旧系统行为（包括 bug）就是规格"。

### 社区（课程中列为候选、未写入）

- [r/ExperiencedDevs](https://www.reddit.com/r/ExperiencedDevs/) — 迁移经验讨论
- [r/Programming](https://www.reddit.com/r/programming/) — 迁移/重构方法论文

## B. 本地引用方式（repo 惯例 + 已加载 skills）

写 `migration-reviewer-generate` / `migration-reviewer-audit` 时依循了本仓库惯例与两个编写 skill 的规范：

- **仓库惯例**（模式参考）：
  - `skill-architect` — skill 结构模式（orchestrator + references/assets 外置）
  - `dependency-migrator` — 迁移类技能目录/模板风格
  - `orchestrating-subagents` — grounded grilling 门控语气
- **编写规范 skills（已加载并执行）**：
  - `writing-for-agents` — `C:\Users\A\.agents\skills\writing-for-agents\SKILL.md`：description 触发式不写流程摘要、progressive disclosure、skill 与 references 分离
  - `writing-skills` — `C:\Users\A\.claude\skills\writing-skills\SKILL.md`：自检（frontmatter 只 name+description、长度≤1024、无乱码占位符）
  - `writing-readme` — `E:\my-open-skills\.agents\skills\writing-readme\SKILL.md`：本仓库 README 双语表格+安装行惯例

## C. 产出物（review 对象）

- 教程：`E:\my-open-skills\migration-course\` 下 6 课 + glossary + cheatsheet + index（全部自包含、相对路径导航）
- 方法论 meta-skill：`E:\my-open-skills\migration-reviewer-generate\`（生成侧）
  `SKILL.md` + `README.md` + `references/{methodology,diagnosis-guide,self-check}.md` + `assets/{skill,rule,agent-topic}-template.md` + `assets/smoke-example/`（回归冒烟：fixtures + run-smoke.ps1）
- 评审执行 skill：`E:\my-open-skills\migration-reviewer-audit\`
  `SKILL.md` + `README.md` + `references/{methodology,self-check}.md` + `assets/report-template.md`
- 依赖清单：`E:\my-open-skills\migration-course\RESOURCES.md`

## D. 已知缺口 / 风险（review 时留意）

- 教程外部链接指向中文社区较少，方法论以英文为主（`RESOURCES.md` Gaps 节）。
- "Business Rules Inventory" 目前只依赖 CoreStory 一家，缺中性第三方佐证。
- 生成的 meta-skill 已做端到端冒烟：`migration-reviewer-generate/assets/smoke-example/` 的 fixtures 被跑通，产出 5 条纯 diff 不可见的具体发现（MISSING apply_coupon、舍入/错误面/audit 文本/数值语义 DIFFERS），`run-smoke.ps1` 可作回归。