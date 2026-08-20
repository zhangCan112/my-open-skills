# Migration Reviewer — Generate（适配器搬迁审查 · 生成侧）

> 本文件是 `migration-reviewer-generate` 的**完整中文文档**，供学习与 review 使用。
> 规范版本是英文的 `SKILL.md` 与 `references/`。若中英不一致，以英文版为准。

## 一句话定位

针对**一种且仅一种**迁移场景——**适配器搬迁（adapter relocation / re-host，分类号 A6）**：同一个 adapter 从宿主 App A 搬到宿主 App B——从一个真实场景出发，产出该场景专属的 review 工件（独立 skill / 挂进现有 skill 的规则块 / agent 主题 / 一次性检查清单）。检查清单**从场景里写出来**，绝不做"通用模板填空"。

## 适用与不适用

**适用（四形态任选其一）：**

| 用户想要 | 产出 | 模板 |
|---|---|---|
| 一个迁移 review skill | `migration-review-<场景>/` 独立 skill | `assets/skill-template.md` |
| 给现有 skill 补一条迁移规则 | 一个 markdown 规则块 | `assets/rule-template.md` |
| 给 agent 加迁移审查主题 | 一段 topic/persona | `assets/agent-topic-template.md` |
| 这次迁移的检查清单 | 短文档，直接写 | 无需模板 |

**不适用：** 其他迁移类型（跨语言重写、框架升级、服务拆分、DB→应用层、换库/换 API）、普通 code review、执行迁移本身（用 `dependency-migrator`）。用户想直接对真实前后代码跑 review 时：先按本 skill 生成清单，再把它应用到一个真实切片上（Phase 3 冒烟就是这次就地审查）。

**触发词：** "适配器要从 A 搬到 B 怎么查"、"re-host / adapter 搬迁 review"、"检查搬迁没漏 B 的要求"。

## 核心思想：双 oracle（dual oracle）

A6 的本质：**代码没换世界，是世界换了代码**——移动的不是逻辑，而是逻辑的"宿主上下文"。因此规格不再唯一，场景天然裂成两半，各有各的规格：

| 分区 | 内容 | oracle（规格来源） |
|---|---|---|
| **纯核心逻辑**（pure core） | 翻译、校验、决策 | 旧核心（legacy core） |
| **获取 seam**（acquisition seams，在核心内） | env/config 键、DI、时钟、下游 provider | 预期被重指向 B → 每条一个 `RE-POINTED` 验证行 |
| **宿主胶水**（host glue） | 参数/字段名、错误码与文案、payload 形状、日志前缀、DI/生命周期注册 | 宿主 B 的契约（B's contract） |

三条反直觉规则：

1. **diff 逻辑被反转**：新胶水长得像旧胶水才是 bug（A 残留），长得不像反而常是对的（`INTENDED`）。
2. **单 oracle 必瞎一半**：只看 A 会漏"B 要求但 A 从来没有的东西"；只看 B 会放过"从 A 偷偷带进来的状态"。
3. **变化要先分类再判定**：seam 变了 → `RE-POINTED`，验行为；纯逻辑变了 → 才是 `DIFFERS`。字节一致是需要 byte-oracle 证明的特例，不是默认期待。

## 铁律（Iron rule）

```
NO checklist, NO document, NO skill — until the scene is grounded from the user's actual facts.
```

**Grounded（落实）** = 宿主 A→B、范围（哪个 adapter 模块 + 胶水路径）、证据类型（旧测试可跑？fixtures？legacy 能在本环境运行？）三者从用户处确认，或从上下文推断后**显式复述**给用户确认。不许凭假设推进；事实可选时要给出推荐默认值并标注。**无例外**——不许"我记得就是这样的"，不许"看项目名显然是"。

## 四阶段流程

```
Phase 0 诊断 → 事实齐? ─否→ Phase 1 追问 ─┐
              └是→ Phase 2 产出 → Phase 3 自检+冒烟 → 用户批准 → 交付
                                  ↑__________________________│（修改后重来）
```

### Phase 0 — 诊断（先从上下文榨取，再开口问）

1. **解析事实**：宿主 A → 宿主 B、范围、想要的工件形态。
2. **确认 A6 形状**（三条全中才算，否则明说"不是本 skill 的场景"并停止）：
   - 搬的是**同一个 adapter 模块**（移植/重新挂载，不是新写一个）；
   - **宿主变了** App A → App B（不同的 app/框架/启动器，各有各的约定）；
   - **框架侧不变**（只有宿主侧被重新接线）。
3. **从代码分区**（三区，每行归且只归一区，见上文分区表）：
   - 逐行启发式：**"如果宿主换成 C（第三个宿主），这行会变吗？"** 会 → seam 或 glue；不会 → 纯核心。拿不准的行默认归 seam/glue——更安全的错误是多验证，不是假设一致。
   - **seam 枚举是扫描动作，不是记忆测试**：对核心 grep 宿主设施 import、env/config 读取、DI 查找、时钟调用、下游端点。类别清单只是提示，**什么算 seam 由本场景代码决定**，扫完与用户对账。绝不凭记忆写"没有 seam"。
   - **B 契约**：若 B 的规则没写下来，先把它枚举出来（B 的文档、B 的框架约定、B 里已运行的兄弟 adapter、middleware/生命周期源码）——这是**前置交付物**，胶水无法对一个不存在的 oracle 验证。
4. **列出未定事实** → 变成 Phase 1 的问题。
5. **选定工件形态**（四形态之一）。

### Phase 1 — 追问（一次一问，每问带推荐答案）

先复述推断出的事实让用户确认/纠正。必问三件事：

- **范围** — 哪些路径/包在范围内，哪些明确不在。
- **证据** — 旧测试可跑？golden 语料？legacy 在本环境能运行？→ 决定可达验证梯队。已有规则清单（Business Rules Inventory）？有则直接对照它查，不重建。
- **工件形态** — 独立 skill / 规则块 / agent 主题 / 一次性清单。

场景留白时才问的分支问题：

- **最怕的风险**（支付、排序保证、状态机、校验规则…）→ 该核心逻辑上最高验证梯队。
- **消费方契约** — 有外部调用方解析错误文案/状态码/顺序吗？（隐形行为层）
- **B 的契约** — B 的规则文档/约定/兄弟 adapter 存在吗？不存在 → 前置交付物。
- **数据搬迁** — 数据要迁吗？必须无损吗？→ Tier 4 对账。
- **语言** — 中/英/双语（默认跟用户）。

**Gate：** 核心事实（A→B、范围、证据）确认。

### Phase 2 — 产出

1. 载入 `references/methodology.md`（六件套主轴）+ 对应模板。
2. 构建工件：名称、触发描述、范围、**A6 专属**清单（分区、`RE-POINTED` seam 行、B 触点合规、A 残留扫描）、可达验证梯队、gate——全部落在确认过的场景上。
3. **不要**把整篇方法论内联进工件——链接 `references/`。工件保持一次 review 可扫完的长度。

### Phase 3 — 自检 + 冒烟

1. 跑 `references/self-check.md`，修掉每一条发现。
2. **冒烟**：场景里有真实前后文件对 → 用清单审一个小的真实切片（一个函数/一对文件），确认产出具体发现而非泛泛而谈；没有 → 明说，然后用一个合成样例顶替。可离线回归用 `assets/smoke-example/run-smoke.ps1`。
3. 提交用户签收。

**Gate：** 用户批准。批准过早的信号：冒烟零真实发现；清单是六条通用类别原文而非 A6 专属行。

## 方法论：六件套 × 双分区

### 六件套（所有场景通用的主轴）

1. **行为清单（Behavior Inventory）**：枚举范围内**每一条**旧行为，不跳读。每行一条 + `file:line`。覆盖：分支（每个 if/else/三元/switch case 各算一条）、事件处理器、派生状态、守卫（判空/兜底/默认分支）、错误路径、i18n（照抄原文）、副作用（DB 写、事件、日志/审计、通知）。清单即检查表：每行要么出现在新代码，要么被有意省略并注明。
2. **规则清单（Business Rules Inventory）**：先提取"什么必须保留"再比较。区别于行为清单：这是**意图**不是实现。每条规则：ID · 可验证断言 · 旧位置 · 分级（critical/important/minor）。已有现成规则清单则复用为基准契约。旧代码里有 workaround/死代码——清单记录的是*应该*保留什么，不是每一行。
3. **差异三分类**：源行为逐一对比目标。`MISSING`（目标完全没有，high）/ `PARTIAL`（有但不完整，medium，最易漏）/ `DIFFERS`（有但逻辑变了，high）。省略一律 `MISSING`，除非目标带明确的"有意省略"注释。`DIFFERS` 要说清差在哪（字段/分支）。反驳常见合理化："差异是有意的"→ 有意省略要注释，没注释就是 bug；"边缘情况不会发生"→ 旧行为处理它自有原因；"后续补"→ 记债或现在修。
   **五态报告契约**（每条规则的最终状态）：`Equivalent`（验证一致）/ `Improved`（有意的、有记录的改进）/ `Different`（变了，带差异标签+意图分类）/ `Missing`（缺失）/ `NotVerified`（无证据）。只有"有意且有记录"才算 `Improved`——没记录的变更就是 `DIFFERS`。`NotVerified` **不是**通过。
4. **隐形行为与不变量**：diff 看不见的。逐行扫：默认值、顺序（排序/迭代/序列化顺序，下游可能依赖）、时序（超时/重试/限流）、日志与审计、错误表面（状态码/错误码/文案，消费方可能在解析）、不变量（状态机迁移、"余额不为负"、"时间戳全 UTC"）、**非代码工件**（DB 约束/触发器/存储过程、批处理/cron、配置默认值、消息 schema——打 `kind: DB|batch|config|schema` 标签入清单）。单条规则都等价时也要查不变量：孤立的每条都对，交互可能漂移。
5. **验证梯队**：静态审查只说"看起来完整"，真相在执行里。
   | Tier | 方法 | 证明什么 | 需要 |
   |---|---|---|---|
   | 1 | 静态交叉核对 | 覆盖看起来完整 | 代码可读 |
   | 2 | 特征化测试（golden master）+ 消费方契约测试 | 同输入同输出；每个消费方契约成立 | 可跑的 legacy + 输入语料，或契约 harness |
   | 3 | 影子流量对比 | 生产负载下的 parity | 双系统可跑的生产流量 |
   | 4 | 数据对账 | 迁移数据无损 | 新旧数据存储（行数、校验和、计算字段、FK 完整性） |
   golden master：选一个业务函数，代表性输入（含边界+错误路径）在旧系统跑出 fixtures，新系统必须逐字段匹配；浮点/舍入考虑数值容差；只有有记录的有意偏差才允许升级 golden 文件。迁移里特征化测试比规格测试安全：**生产行为——包括 bug——就是用户依赖的东西**。
6. **等价报告 + 人类闸门**：审计没写下来就没完成。结构：摘要（五态计数 + 结论：release / fix-first / rewrite）→ 逐规则表 → 行为差异（含分类：有意改进/可接受偏差/回归）→ 缺失规则 → 边缘情况与不变量 → 集成点 → 建议+签字。**漂移信号**：`MISSING + DIFFERS` 超过枚举行为约 20% → "迁移"已漂变成重写，结论改口 `rewrite, not migration`。**HITL 闸门**：领域专家签字后才能退役旧系统；只把真正模糊的意图判断交给专家，不是每一行。

### 双 oracle 变体（A6 专属叠加）

| 件 | 适配器核心（oracle：旧核心） | 宿主胶水（oracle：B 契约） |
|---|---|---|
| 1 清单 | 对照旧核心枚举核心行为；逐行用"换宿主 C"启发式分区；seam 靠**扫描代码**枚举（宿主设施 import、env/config、DI、时钟、下游端点），绝不凭记忆；每个 seam 一等一行 | 枚举 B 的强制触点（auth、metrics/遥测、banner、生命周期钩子、配置键、错误 payload 形状）——B 契约清单 |
| 2 规则 | 照常从旧核心提取必须保留项 | 规则 = B 契约里的 B 约定；B 无法承载的行为的 preserve/translate/degrade/drop 决策在这里记录，不许临场发挥 |
| 3 分类 | 对照旧核心。seam 为 B 改写 → `RE-POINTED`（预期变更；仍要验行为）。B 承载不了的行为 → 映射 **preserve / translate / degrade / drop**，每条有记录——没记录的 drop 是 `MISSING` | 只对照 B 契约。胶水偏离 A 但合规 B → `INTENDED`，绝不是 `DIFFERS`。缺 B 触点 → `MISSING vs B`；残留 A 专属触点 → residue（残留） |
| 4 隐形行为 | 核心不变量与错误表面照搬——去查，别假设 | A 残留扫描：A 的字段名、env 键、错误文案、表/队列名、日志前缀漏进 B |
| 5 验证 | Tier 2 双核心同语料；比较**规范化后**的输出（键序、浮点 ε、时间戳/UUID、无序集合；错误比类型不比文案）——字节相等既非必要也非充分证据；含边界/对抗输入，不只 happy-path；字节一致的主张需要 byte-oracle harness **且**零宿主耦合 | 跑 B 的契约测试 / 在 B 里重跑 port 的契约测试（"adapter 的契约就是它的测试"）；走触点清单 |
| 6 报告 | 每行带 `oracle` 列（`A-core` / `B-contract`）；`RE-POINTED` 和 `INTENDED` 是意图标签不是通过——各自仍要验证证据 | 同左 |

**按分区漂移阈值**：核心的 `MISSING + DIFFERS`（扣除 `RE-POINTED` / `INTENDED`）超过枚举核心行为约 20% → "搬迁"已变成核心重写——明说。

## 自检 DoD（Phase 3 第 1 步，逐条过，跳一条=破一次纪律）

**场景落实**

- [ ] A→B、范围、证据类型确认而非捏造；推断的已显式复述给用户。
- [ ] 场景**确认为适配器搬迁**（同 adapter、宿主 A→B、框架侧不变）；不是就明说，而不是硬套。
- [ ] 工件形态按用户请求选择——不总是"一个 skill"。
- [ ] 场景已分区：核心（对旧核心走完整方法论；seam 标 `RE-POINTED` 并逐条验证；字节一致只在零耦合特例、且经 byte-oracle）vs 胶水（oracle = B 契约，不是 A 的胶水；偏离 A 且合规 B 报 `INTENDED`，绝不报 `DIFFERS`）。
- [ ] 分区来自代码（逐行"宿主 C"启发式），seam 清单靠扫描真实 import/env/config/DI/时钟/provider 引用枚举——不只凭用户记忆。
- [ ] B 契约确认存在——或缺失时已标为前置交付物。

**工件正确性**

- [ ] 独立 skill：`name` 仅字母/数字/连字符；frontmatter 只有 `name` + `description`（合计 ≤1024 字符）；description 以 "Use when…" 开头、列触发词、不摘要工作流。
- [ ] 触发词覆盖用户真会说的话（含用户语言）。
- [ ] Scope 反映确认过的场景，不是通用示例。
- [ ] 清单是 **A6 专属**——有只有 re-host 才说得通的行：`RE-POINTED` seam 行、`INTENDED` 胶水偏离、B 触点 MISSING、A 残留。只有六条通用类别 = FAIL。
- [ ] 报告行带 `oracle` 列；B 无法承载的核心行为有 preserve/translate/degrade/drop 映射；没有 byte-oracle harness 不许主张字节相等。
- [ ] 场景有代码外逻辑时有非代码扫描行（DB 触发器/存储过程、批处理、配置默认值、消息 schema）。
- [ ] 最高风险的核心逻辑行的验证梯队与用户声明的证据匹配。
- [ ] 五态词汇在场（unverifiable ≠ Equivalent）。
- [ ] 漂移护栏在场：`missing + different > ~20%` → 结论 rewrite。
- [ ] 需要报告处有 HITL/人类闸门，写成显式规则。
- [ ] 无未填的 `{{PLACEHOLDER}}`（有记录的示例除外）。
- [ ] 方法论是链接（`references/…`）不是内联长文。

**冒烟**

- [ ] 对小的真实前后切片（或声明的合成替身）跑过清单。
- [ ] 产出至少一条具体发现（真实的 `MISSING/PARTIAL/DIFFERS` 观察），不是"看起来没问题"。
- [ ] 冒烟零发现时停下来要真实代码切片，而不是签收了事。

**任何工件**

- [ ] 无捏造事实：每个主张可追溯到代码、用户、或显式标注的假设。
- [ ] 无"看起来没问题"的死胡同——可疑处都有动作。

**停下重做信号**：场景不是适配器搬迁 → 停，别发 A6 清单；清单是六条通用类别无 A6 行 → 从分区重写；冒烟零发现 → 别发，升级到真实切片；description 摘要了工作流 → 重写；出现"场景很明显，我来填" → 回 Phase 1。

## 常见错误

| 错误 | 修正 |
|---|---|
| 模板原样进了工件 | 清单从场景写出；模板只是骨架 |
| 核心和胶水共用一个 oracle | 核心 → 旧核心；胶水 → B 契约；绝不混用 |
| seam 变更被当回归报 | seam 重指向 B 是 `RE-POINTED` 验证行，不是 `DIFFERS` |
| 胶水偏离 A 被当 bug 报 | 偏离 A 且合规 B 是 `INTENDED` |
| seam 清单凭记忆写 | 扫描代码枚举，再与用户对账 |
| 验证梯队凭空发明 | 梯队来自用户实际声明的证据 |
| 只考虑了一种工件形态 | skill / 规则块 / agent 主题 / 一次性清单都合法 |

## 危险信号 — 停下重做

- 场景不是适配器搬迁（其他迁移类型）却继续推进了。
- 没有分区：范围内行没归到核心 / seam / 胶水。
- 没有 byte-oracle harness（且零宿主耦合）却主张核心字节一致。
- 胶水对着 A 的旧胶水审而不是 B 的契约。
- B 契约缺失却没人标为前置交付物。
- 验证梯队缺失，或用了用户说不可达的梯队。
- 冒烟零真实发现却签收了。

## 术语表

| 术语 | 含义 |
|---|---|
| **oracle** | 判定"对不对"的规格标的物。A6 有两个：旧核心（管核心行为）、B 契约（管胶水合规） |
| **adapter core / 适配器核心** | 框架适配逻辑本身：翻译、校验、决策。搬走后行为必须保持 |
| **acquisition seam / 获取 seam** | 核心里耦合宿主的获取点：env/config 键、DI、时钟、下游 provider。re-host 时合法重指向，标 `RE-POINTED` 并验**穿过 seam 的行为**（不是指针本身） |
| **host glue / 宿主胶水** | 按各宿主约定写的接线层：字段名、错误码/文案、payload 形状、日志前缀、DI/生命周期注册。每次搬迁都重写，只对 B 契约负责 |
| **B 契约（B's contract）** | 宿主 B 的规则集合：强制触点（auth/metrics/banner/生命周期/配置键）、payload 形状等。没有就先产出它（前置交付物） |
| **`RE-POINTED`** | 意图标签：seam 为 B 重指向。是"待验证的预期变更"，不是通过，也不是 `DIFFERS` 红旗 |
| **`INTENDED`** | 意图标签：胶水偏离 A 且合规 B——搬迁的正确结果，绝不报 `DIFFERS` |
| **B 触点（touchpoint）** | B 强制要求的挂钩（auth、emit_metric、banner…）。缺了 = `MISSING vs B`，即使对比 A 什么都没丢 |
| **A 残留（residue）** | A 专属的 env 键/字段名/错误文案/表队列名/日志前缀活进了 B——泄漏 |
| **preserve / translate / degrade / drop** | B 环境承载不了的核心行为的四类去向映射；每条要有记录，没记录的 drop 是 `MISSING` |
| **MISSING / PARTIAL / DIFFERS** | 差异三分类：完全没有 / 有但不完整（最易漏）/ 有但逻辑变了 |
| **五态** | 报告里每条规则的最终状态：Equivalent / Improved / Different / Missing / NotVerified |
| **byte-oracle** | 证明字节一致的正经 harness（如编译产物逐字节比对）。只有零宿主耦合的核心才允许主张字节一致 |
| **规范化比对** | 行为等价的判定方式：键序、浮点 ε、时间戳/UUID、无序集合规范化后比较；错误比类型不比文案 |
| **漂移阈值** | `MISSING + DIFFERS`（扣意图标签）> ~20% → 迁移已变重写，改口结论 |

## 五类典型病灶（冒烟 fixtures 详解）

场景：`framework → adapter core → 胶水A → App A(ATLAS)` 搬成 `framework → adapter core → 胶水B → App B(ORB)`。

| # | 标签 | 病灶 | 为什么 diff 看不见 |
|---|---|---|---|
| F1 | `RE-POINTED` | seam `PROVIDER_SOURCE` 从 `A:ATLAS_FX` 重指向 `B:ORB_FX`，`normalize_currency` 逻辑原样搬 | diff 看到变的行就报 `DIFFERS`；双 oracle 分类标记这是预期重指向，要的是行为核查不是红旗 |
| F2 | `INTENDED` | 胶水整体换血：`ATLAS_MODE`/`"error"`/`label` → `ORB_SECTION`/`reason`/`display` | "旧行为即规格"会把所有 A→B 胶水变化都当缺口；双 oracle 把它们重新锚到 B |
| F3 | `DIFFERS` | A 残留：`LEGACY_WIRE = "ATLAS"` 被带进 B 区域 | diff 觉得常量活着挺好；它是不得进入 B 的 A 专属状态 |
| F4 | `MISSING` | B 独有要求缺失：B 要求每次发布渲染调 `emit_metric(name)`，搬过来的 `view()` 没调 | 对 A 什么都没丢，旧 vs 新对比永远看不见——只有 B 契约能发现 |
| F5 | `DIFFERS` | 排序保证被悄悄委托给 provider：旧核心 `sorted(raw)`（A 返回乱序，核心拥有排序保证）→ 新核心 `list(raw)`（假设 B 已排好）。seam 重指本身没错——**穿过 seam 的行为**漂了 | diff 看到的是一次无害简化；只有"验行为不验指针"+ 隐形行为（顺序）视角能抓住 |

**golden-master 语料（Tier 2）**：同一规范化货币语料 {USD, EUR, GBP, USDT, JPY, None} 喂双核心断言输出一致；费率列表 {已排序, 逆序, 含重复} 过双核心 `ordered_rates` 暴露 F5；各宿主胶水对各自契约 fixtures 跑（B 胶水对 B 契约）。

## 回归冒烟

```powershell
powershell -ExecutionPolicy Bypass -File .\assets\smoke-example\run-smoke.ps1
# exit 0 = 5 条预期发现全部可见；exit 1 = 回归
```

改动 `assets/` 或 `references/` 后运行。给 fixtures 加新病灶类别时，先在 `expected-findings.md` 加预期（TDD 式），再让模板产出它。

## 快速参考

| Phase | 产出 | Gate |
|---|---|---|
| 0 诊断 | A6 场景确认：宿主、adapter 范围、分区、工件形态 | — |
| 1 追问 | 剩余事实确认（seam、B 契约、证据） | 场景 grounded |
| 2 产出 | 清单 / skill / 规则块 / 主题工件 | — |
| 3 自检+冒烟 | DoD 通过；迷你审查产出真实发现 | 用户批准 |

## 安装

```bash
cp -r migration-reviewer-generate ~/.claude/skills/
```

## 许可证

MIT License

[English](./README.md) · 规范版本：[SKILL.md](./SKILL.md) · 方法论：[references/methodology.md](./references/methodology.md)
