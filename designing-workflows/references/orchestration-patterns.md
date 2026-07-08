# 编排模式速查（orchestration-patterns）

Phase 3（倒推分解）按需加载。用于选择 playbook 的编排模式。

## 选择原则

**默认从最简开始，只有当能证明它改善结果时才加复杂度**（原则 4：最简优先）。单次 LLM 调用能解决的，别套 orchestrator-workers。先证明有收益，再加复杂度。

## 六种编排模式

| 模式 | 适用 | 复杂度 |
|---|---|---|
| 单次 LLM 调用 | 能一步搞定 | 最低（先考虑） |
| Prompt 链 | 可干净拆成固定子步骤 | 低 |
| 路由 | 输入可分类、各类适合不同处理 | 中 |
| 并行（分区/投票） | 子任务独立可并行 / 需多视角 | 中 |
| Orchestrator-workers | 子任务无法预知、需动态分派 | 高 |
| Evaluator-optimizer | 有明确评价标准、迭代有收益 | 高 |

## 组合

生产级 playbook 常组合多种：例如外层 Prompt 链，某个 phase 内用 Orchestrator-workers，另一个 phase 用 Evaluator-optimizer 做质检。组合时每个 phase 仍只声明一种主模式。
