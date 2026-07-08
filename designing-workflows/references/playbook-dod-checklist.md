# Playbook Definition of Done 自检清单（playbook-dod-checklist）

Phase 6（产出+自检）按需加载。用于验收产出的 playbook 能否盲跑。

## Definition of Done

> 任意的 agent 拿到这份 playbook，能**按 phase 逐步正确执行**——每个 phase 只加载它那一个 step 文件，**中途不需要再回来问设计问题**。

## 自检清单

| 检查 | 通过条件 |
|---|---|
| 盲跑可行 | 不缺输入、不缺能力引用、不缺判定标准 |
| 分层正确 | 规模超阈值的一定拆成目录，不是平铺单文件 |
| 能力真实 | 每步引用的能力都在 Phase 2 能力池内 |
| 分类正确 | 没把 tool 该做的标成 skill，或反之 |
| 没过度编排 | 没有该单步却套多 agent 的情况 |

## 验收协议

1. 对照上表逐条标记 ✅ 通过 / ❌ 未通过。
2. 有 ❌ → 回 Phase 4 修正，再回本清单，**不交付**。
3. 全部 ✅ → 交付。
