# CoreStory Playbooks — 学习资源总表

> 所有课程内容的一手来源均为官方文档。语言为中文讲解、英文术语。

## Knowledge

- [官方文档首页 — Playbooks](https://docs.corestory.ai/playbooks)
  Playbook 总览：现代化 & 迁移、AI 辅助开发、测试与验证、集成四大类。用于搭建课程总地图。
- [官方文档索引 llms.txt](https://docs.corestory.ai/llms.txt)
  全部页面链接清单（机器可读）。用于快速导航、抓取任意一级页面。
- [How Does CoreStory Work?](https://docs.corestory.ai/about/how-does-corestory-work.md)
  CoreStory 的输入/摄取/输出/集成模型，理解"代码智能"从何而来。所有教程的知识底座。
- [What is CoreStory?](https://docs.corestory.ai/about/what-is-corestory.md)
  平台定位：用 AI 从源码反向工程出规范（specifications）。用于解释"持久化智能层"。
- [Supercharging AI Agents with CoreStory](https://docs.corestory.ai/getting-started/supercharging-ai-agents.md)
  MCP 配置、8 个 MCP 工具、Expert/Navigator 角色与核心交互范式。所有 playbook 的运行时基础。
- [Code Modernization](https://docs.corestory.ai/playbooks/code-modernization.md)
  六阶段现代化框架的枢纽文档（含 7 Rs、Confidence Protocol、执行模式、技能安装表）。
- [Codebase Assessment](https://docs.corestory.ai/playbooks/modernization/codebase-assessment.md)
  阶段 1：六步评估工作流 + 准备度评分 1-5 + Modernization Readiness Report 模板。
- [Business Rules Extraction](https://docs.corestory.ai/playbooks/business-rules-extraction.md)
  阶段 2：BR-XXX 编号清单、验证矩阵、Confidence Protocol、声明但未强制执行附录。
- [Target Architecture & Strategy Selection](https://docs.corestory.ai/playbooks/modernization/target-architecture.md)
  阶段 3：7 Rs 决策、行为标签（PRESERVE/MODERNIZE/CHANGE/NEW/RETIRE）、ADR 模板。
- [Decomposition & Sequencing](https://docs.corestory.ai/playbooks/modernization/decomposition-sequencing.md)
  阶段 4：工作单元（work package）、依赖映射、Transform→Coexist→Eliminate（TCE）结构、Jira/Linear 落地。
- [Monolith to Microservices](https://docs.corestory.ai/playbooks/modernization/monolith-to-microservices.md)
  阶段 5 变体：服务边界、数据库拆分策略、strangler fig 执行、Saga 与 outbox。
- [Behavioral Verification](https://docs.corestory.ai/playbooks/modernization/behavioral-verification.md)
  阶段 6：四层验证策略（静态/动态/生产级/数据迁移）、Behavioral Equivalence Report、行为等价证明。
- [Spec-Driven Development](https://docs.corestory.ai/playbooks/spec-driven-development.md)
  "地面/规范/验证/规划/实现/校验"六相位，delta spec、invariant-first、reuse-first、pre-mortem。
- [Spec Kit Companion](https://docs.corestory.ai/playbooks/spec-kit-companion.md)
  与 GitHub Spec Kit 的集成映射（/speckit.* 命令 ↔ 六相位）。
- [Spec-Driven Test Generation](https://docs.corestory.ai/playbooks/spec-driven-test-generation.md)
  测试生成总纲：code-mirroring vs. specification-driven 测试的对比哲学。
- [Behavioral Test Coverage](https://docs.corestory.ai/playbooks/test-generation/behavioral-test-coverage.md)
  上游主测试流程：behavioral inventory → gaps → generate（模块 10-30 用例/域 30-80 用例）。
- [E2E Test Generation](https://docs.corestory.ai/playbooks/test-generation/e2e-test-generation.md)
  用户旅程级 E2E 测试：journey extraction → flakiness 管理（3 次运行稳定性检验）。
- [Feature Implementation](https://docs.corestory.ai/playbooks/feature-implementation.md)
  六相位功能实现（Ticket Intake → Understanding → Planning → Test-First → Completion → Capture）。
- [Agentic Bug Resolution](https://docs.corestory.ai/playbooks/agentic-bug-resolution.md)
  六相位 bug 修复（Expert 先理解设计意图，再 failing test-first 根因调查、最小修复）。
- [Feature Gap Analysis](https://docs.corestory.ai/playbooks/feature-gap-analysis.md)
  七个维度的 Gap 分析（现有能力/数据模型/UI/业务逻辑/渲染/集成/约束）→ 报告 → 实施计划。
- [M&A Technical Due Diligence](https://docs.corestory.ai/playbooks/ma-technical-due-diligence.md)
  技术尽调的四大风险域与审查，快速风险审计（24–48 小时 vs 传统 2–4 周）。
- [Using CoreStory with Jira](https://docs.corestory.ai/playbooks/using-corestory-with-jira.md)
  Jira MCP + CoreStory MCP + Agent 三方编排：解析/增强/新建/分诊四工作流。

## 外部权威参考（playbook 中引用的方法学来源）

- [Martin Fowler — Strangler Fig pattern](https://martinfowler.com/bliki/StranglerFigApplication.html)
  增量现代化默认模式的理论出处。被 playbook 引用为 "Strangler Fig (Default)"。
- [Sam Newman, *Monolith to Microservices*](https://www.oreilly.com/library/view/monolith-to-microservices/9781492047834/)：《Monolith to Microservices》一书，"Branch by Abstraction" 与分布式事务（Saga）的出处。
- [Michael Feathers — *Working Effectively With Legacy Code*](https://www.oreilly.com/library/view/working-effectively-with/0131177052/)：characterization testing / golden master（刻画测试）的出处，被 "Behavioral Verification" 引用。
- [Microsoft Engineering Playbook — Shadow testing](https://microsoft.github.io/code-with-engineering-playbook/automated-testing/shadow-testing/)：shadow traffic testing（影子测试）的参考标准。
- [Kyndryl 2025 State of IT Infrastructure Report](https://www.kyndryl.com/us/en/perspectives/articles/2025/01/state-of-it-infrastructure-report)：混合策略 53%、70% 组织难以招聘到现代化人才等统计，被多处引用。
- Gartner / AWS / Azure "7 Rs" 现代化策略（本源出处），playbook 在 Phase 3 使用。

## Wisdom（社区）——用于验证真实落地

- [r/ExperiencedDevs (Reddit)](https://www.reddit.com/r/ExperiencedDevs/)：遗留系统现代化、团队治理的老手经验，适合在真实执行前的组织层问题（预算、治理、HITL）。
- [r/microservices (Reddit)](https://www.reddit.com/r/microservices/)：microservice 拆分、Strangler Fig、依赖编排的对国经验。
- 本地/社群：若你在真实工作流中落地课程里的 playbook，可回到这里记录复盘（前提是你愿意）。
- **Gaps**: 尚未发现 CoreStory 官方之外的社区/论坛（没有官方 Discord / subreddit）。注明：用户偏好直接在真实工作中验证，不主动加入社区（见 NOTES）。

## Gaps / 待观察

- CoreStory 官方文档目前只有 `llms.txt` 可下载索引。尚无社区最佳实践，这些 playbook 的在野真实案例漏洞，待用户在真实项目中的反馈来填补（记录在 NOTES.md）。