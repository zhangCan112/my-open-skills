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

### 适配器搬迁 / re-host（A6 补充，2026-08 调研）

> 支撑 `diagnosis-guide.md` 的 A6 迁移类型（`portable core` vs `host glue` 分区、双 oracle、"旧行为即规格"只在核心段成立）。分三类：

- [Martin Fowler: Legacy Displacement — Feature Parity](https://martinfowler.com/articles/patterns-legacy-displacement/feature-parity.html)
  旧代码当规格 + 用"可执行契约"对新系统复验。双 oracle 里"核心对旧代码、胶水对 B 契约"的雏型。
- [GitLab: Hexagonal Monolith — handbook](https://handbook.gitlab.com/handbook/engineering/architecture/design-documents/modular_monolith/hexagonal_monolith/)
  adapter 是纯胶水、可换宿主核心不动 —— 判断"哪段能搬、哪段是胶水"的结构判据。
- [ThoughtWorks: 六边形架构落地示例](https://www.thoughtworks.com/en-us/insights/blog/architecture/hexagonal-architecture-explained-practical-example)
  换基础设施/宿主不改 domain/adapter 逻辑，是 A6"核心字节级一致"的经验依据。
- [AWS Prescriptive Guidance: Hexagonal best practices](https://docs.aws.amazon.com/prescriptive-guidance/latest/hexagonal-architectures/best-practices.html)
  同上，验证策略（domain 单测 / ports contract / adapters 薄测）。
- [rustqual: adapter-parity](https://github.com/SaschaOnTour/rustqual/blob/main/book/adapter-parity.md)
  每个 adapter 必须触达同一边界 target 触点集，缺即漂移 —— 胶水对齐检查的灵感。
- [pi/BRIDGE.md — Pinperepette/context-kernel](https://github.com/Pinperepette/context-kernel/blob/main/pi/BRIDGE.md)
  "逻辑归宿主 harness、bridge 只是薄 adapter"；host 移植不允许在桥里塞宿主逻辑。
- [Start Debugging: Semantic Kernel Plugin → MCP server](https://startdebugging.net/2026/05/migrate-a-semantic-kernel-plugin-to-an-mcp-server/)
  drop-in bridge vs native rewrite 两种路径；宿主间差异（host-specific 细节归 harness/adapter）随核心搬。
- [Microsoft Agent Governance Toolkit — Framework Adapter Contract](https://microsoft.github.io/agent-governance-toolkit/specs/FRAMEWORK-ADAPTER-CONTRACT-1.0/)
  宿主干预点/生命周期契约：宿主-B 专属"必挂钩"（banner/metric/auth）的模型，即 A6 的 B 契约 MISSING 检查。
- [VibeRails: AI Code Review for Framework Migrations](https://viberails.net/use-cases/migration-code-review)
  adapter/compatibility layer 残留与 hybrid-state 风险："迁移没完成"的病灶常在适配层。
- [pluxx-translate-hosts — orchidautomation/pluxx](https://github.com/orchidautomation/pluxx/blob/main/plugins/pluxx/skills/pluxx-translate-hosts/SKILL.md)
  跨宿主行为映射的 preserve/translate/degrade/drop 四类：A6"对 B 预期迁移/降级/丢弃"的表述来源。

**论文 / 深度阅读（"oracle" 的种类，双 oracle 命名）：**

- [MatchFixAgent (arXiv:2509.16187)](https://arxiv.org/html/2509.16187v2)
  语义分析与测试 oracle 结合验证等价迁移；"oracle 不是单点"是多 agent 合成。
- [ACToR: Adversarial Agent Collaboration, C → Safe Rust (arXiv:2510.03879)](https://arxiv.org/html/2510.03879)
  discriminator agent 主动找差异，translator 修 —— 验证不该只信"旧=规格"，也要能挑刺。
- [Mokav: execution-driven differential testing (arXiv:2406.10375)](https://arxiv.org/html/2406.10375v1)
  LLM 差分测试生成 DET（差异暴露输入集）。
- [Testora: 自然语言 oracle (arXiv:2503.18597)](https://arxiv.org/html/2503.18597v1)
  判"有意 vs 无意"行为差异 —— 双 oracle 场景里"对 old 差异可能是预期"的分类参考。
- [MigrateLib: 端到端 Python 库迁移 (arXiv:2510.08810)](https://arxiv.org/html/2510.08810)
  基于测试复验的一整套迁移闭环。
- [PSRO / Double Oracle 原义（NeurIPS 2017, "A Unified Game-Theoretic Approach"）](https://proceedings.neurips.cc/paper_files/paper/2017/paper/3323fe11e9595c09af38fe67567a9394-Paper.pdf)
  博弈论里"双 oracle/策略生成"的词源 -- A6 借其"两个规格标的物"命名。

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
- "Business Rules Inventory" 目前只依赖 CoreStory 一家，缺中性第三方佐证（Martin Fowler 的 Feature Parity 可作补充视角，但非专门论述业务规则清单）。
- 适配器搬迁（A6）的外部来源已在"### 适配器搬迁 / re-host（A6 补充）"补录（六边形/结构判据、宿主-适配器契约、oracle 文献三类）；未入课程主线，仅生成侧使用。
- 生成的 meta-skill 已做端到端冒烟：`migration-reviewer-generate/assets/smoke-example/` 的 fixtures 被跑通，当前产出 9 条纯 diff 不可见的具体发现（跨语言 5 条 + 适配器搬迁 A6 4 条：核心字节一致 / 胶水按 B / A 残留泄漏 / B 契约缺失），`run-smoke.ps1` 可作回归。