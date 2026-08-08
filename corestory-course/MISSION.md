# Mission: CoreStory Playbooks 实战与技能沉淀

## Why

我在真实工作中希望用 CoreStory 的 Playbooks 解决"团队反复卡住"的工程问题——遗留系统现代化、在陌生代码库开发功能、生成可靠测试、Agentic 修 bug。同时，这套文档的作者为每个 playbook 都附带了可直接安装的 Agent 技能文件（SKILL.md），我的长期工作是把这个开源仓库（my-open-skills）打造成一套可复用、可对外分享的 Agent 技能集合。学会这些 playbook，既能立即用于手上项目，又为"把方法论提炼成技能"提供了成熟的模板与词汇。

## Success looks like

- 面对一个遗留代码库时，能独立跑通六阶段现代化框架（评估 → 规则提取 → 目标架构 → 分解排序 → 迭代执行 → 行为验证），产出对应的报告产物。
- 在任意一个我负责的代码库上用 CoreStory MCP + AI Agent 完成至少一个真实 Playbook 流程（例如补测试、feature 实现、bug 修复）。
- 我把至少三个 CoreStory playbook 转写成本仓库里结构完整、可直接安装的 SKILL.md 技能（含 Claude Code / Cursor / AGENTS.md 三种安装形态）。
- 建立自己的"核心专业术语"（MCP 工具、Expert/Navigator/Verifier 三角色、Confidence Protocol、7 Rs、TCE 循环等）能够不查资料解释给同事。

## Constraints

- 学习语言：中文。技术术语与原始链接保留英文原文，便于对照文档。
- 学习是"会话制"的：每次课聚焦一个 playbook，可几分钟内完成。
- 原始学习材料完全来自 https://docs.corestory.ai/playbooks （权威一手来源），不依赖二手教程。
- 不在课程里虚构真实系统运行结果——quizzes 的样例均为文档自带的假设系统（如 e-commerce monolith 示例）。

## Out of scope

- 不深入 CoreStory 平台的商业费用、账号配置之外的部署细节（这是官网快速开始的范畴，非 playbook 方法论）。
- 不做具体微架构/框架选型的深度代码演示（例如具体如何写 Spring Boot）——那是执行层面，超出本课程的知识边界。
- 不与 GitHub AGENTS.md 之外的"技能分发机制"变化做捆绑——技能模板以官方文档安装表为准。