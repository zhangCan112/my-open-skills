# 04 · 文案规范(Copywriting)

> 原则:短句、动词开头、不用感叹号、不卖萌;错误信息 = **原因 + 建议**;所有文案集中在一个 i18n 表,禁止散落字符串字面量。

---

## 一、术语表(全产品统一,不得同义混用)

| 术语 | 英文(key) | 定义 | 禁用说法 |
| --- | --- | --- | --- |
| 基准项目(A) | baseline | 左侧/当前项目 | 源项目、主项目 |
| 参照项目(B) | target | 右侧/被比较项目 | 目标项目、对方 |
| 键 | key | 配置项路径(如 `database.pool.maxSize`) | 字段、配置项路径名 |
| 差异 | difference | 一个键对的有效状态 | 不同点、冲突 |
| 忽略 | ignore | 命中规则,不参与比较 | 跳过、排除、隐藏 |
| 规则等价 | equivalent-by-rule | 命中等价规则,视为一致 | 视为相同、等值 |
| 类型宽化 | coerce | number↔string 互等 | 类型转换、强转 |
| 文件配对 | pair | 两侧文件的对应关系 | 文件映射 |
| 结果已过期 | stale | 比较后源文件已改动 | 已失效、需重算 |

## 二、语气规则

1. 按钮 ≤6 字,动词开头:「选择两个项目…」「添加规则」「刷新」。
2. 说明句 ≤2 行;先说是什么,再说怎么操作。
3. 错误 = 原因 + 建议:`无法解析 application.yaml:第 12 行缩进错误。请修复后点「刷新」。`
4. 数字用阿拉伯数字;键路径一律等宽字体呈现(样式层处理,文案表只存裸串)。
5. 省略号 `…` 表示"还有下一步";不用于装饰。

## 三、全量文案表(实现必须逐条采用)

| ID | 位置 | 中文 | 英文 | 备注 |
| --- | --- | --- | --- | --- |
| T001 | 视图标题 | 配置对比 | Config Diff | — |
| T002 | Welcome 按钮 1 | 选择两个项目… | Compare Two Projects… | 主按钮 |
| T003 | Welcome 按钮 2 | 从最近的比较中选择… | Pick from Recent Compares… | — |
| T004 | Welcome 按钮 3 | 管理收藏的项目对… | Manage Favorites… | 二期 |
| T005 | Welcome 右键提示 | 也可以在资源管理器中右键项目文件夹:Select for Config Diff → Compare with Selected | … | 不提命令面板 |
| T006 | QuickPick 标题 | 选择要对比的配置文件(可多选) | Select Config Files to Compare | — |
| T007 | QuickPick 分组1 | 两侧均存在(推荐比较) | Present on both sides | — |
| T008 | QuickPick 分组2 | 仅在基准项目(A)中 | Only in A | — |
| T009 | QuickPick 分组3 | 仅在参照项目(B)中 | Only in B | — |
| T010 | QuickPick 底栏 | {n} 个文件 · Enter 确认 · Esc 取消 | … | — |
| T011 | 进度 | 正在比较 {n} 个文件… | Comparing {n} files… | — |
| T012 | 进度副行 | 正在解析 {file} | Parsing {file} | — |
| T013 | 完成通知 | 比较完成:{active} 处差异 · {equ} 规则等价 | Done: … | 动作:查看 |
| T014 | 状态栏 | $(diff) {n} 处差异 | $(diff) {n} diffs | — |
| T015 | 状态行-值不同 | 值不同 | Different values | — |
| T016 | 状态行-类型不同 | 类型不同 | Different types | — |
| T017 | 状态行-仅在A | 仅在 {A}(B 缺失) | Only in A | 分组标题带计数 |
| T018 | 状态行-仅在B | 仅在 {B}(A 缺失) | Only in B | — |
| T019 | 状态行-规则等价 | 规则等价(不计入差异) | Equivalent by rule | — |
| T020 | 状态行-已忽略 | 已忽略(规则) | Ignored by rule | — |
| T021 | 状态行-一致 | ✓ 完全一致({n} 键) | Identical | 0 差异时 |
| T022 | 树工具-分组 | 切换分组:按文件 ⇄ 按状态 | Toggle grouping | — |
| T023 | 树工具-刷新 | 刷新比较 | Refresh | — |
| T024 | 树工具-对调 | 对调两侧 | Swap sides | — |
| T025 | 树工具-历史 | 历史与收藏 | History & favorites | — |
| T026 | 叶子动作1 | 打开对比 | Open compare | — |
| T027 | 叶子动作2 | 忽略此键 | Ignore this key | — |
| T028 | 行内动作3 | 设为等价 | Mark equivalent | 仅 mod 行 |
| T029 | 报告-搜索占位 | 搜索键路径或值… | Search keys or values… | — |
| T030 | 报告-全部芯片 | 全部 | All | — |
| T031 | 报告-显示一致项 | 显示一致项 | Show identical | — |
| T032 | 报告-规则抽屉 | 规则({on}/{total}) | Rules ({on}/{total}) | — |
| T033 | 报告-虚拟提示 | 已启用虚拟滚动({n} 行) | Virtual scrolling enabled | — |
| T034 | 报告-absent | — 不存在 — | — absent — | 斜体 |
| T035 | 报告-定位 | 在树中定位 | Reveal in tree | — |
| T036 | 规则视图标题 | 对比规则 | Rules | — |
| T037 | 规则-添加 | 添加规则… | Add Rule… | → 向导 |
| T038 | 规则-编辑源码 | 编辑源码 | Edit Source | → rules.json |
| T039 | 规则空态 | 还没有规则。规则决定"什么算一致"。 | No rules yet. | — |
| T040 | 向导-步骤1 | 选择规则类型 | Choose rule type | — |
| T041 | 向导-简单组 | 简单规则 · 表单输入即可 | Simple rules | 分隔线 |
| T042 | 向导-进阶组 | 进阶 · 编写 JavaScript | Advanced · JavaScript | 分隔线 |
| T043 | 向导-配对项 | 文件配对:指定 A 侧文件对应 B 侧哪个文件 | File pairing | — |
| T044 | 向导-等价项 | 值等价:声明哪些值视为相同 | Value equivalence | — |
| T045 | 向导-忽略项 | 忽略模式:按键路径 glob 跳过比较 | Ignore pattern | — |
| T046 | 向导-脚本项 | 脚本规则:自定义复杂判定逻辑 | Script rule | — |
| T047 | InputBox 等价A | 值等价 · 第 1 步:输入 A 侧值(留空表示 null) | … | — |
| T048 | InputBox 等价B | 第 2 步:输入 B 侧等价值 | … | — |
| T049 | InputBox 范围 | (可选)限定键路径模式,如 database.* | … | — |
| T050 | 规则生效通知 | 规则已生效:{desc}(撤销) | Rule applied (Undo) | 10s 撤销 |
| T051 | 过期黄条 | 结果已过期 · 文件在比较后有改动 | Results are stale | 动作:刷新 |
| T052 | 解析错误 | 无法解析 {file}:{reason} | Failed to parse {file} | 动作:打开文件 |
| T053 | rules.json 语法错 | 规则文件有语法错误,正在使用上一次的有效规则 | Invalid rules file | 动作:打开文件 |
| T054 | diff 头注释 | // Config Diff · {file} · {key} | … | 虚拟文档首行 |
| T055 | diff 类型注释 | // ⇄ 类型不同: {aT} (A) vs {bT} (B) | … | — |
| T056 | diff 等价注释 | // ≈ 视为等价 —— 命中规则: {rule} | … | — |
| T057 | diff 忽略注释 | // ⊘ 已忽略 —— 命中规则: {rule} | … | — |
| T058 | diff 缺失注释 | // 该键仅存在于{左|右}侧({A\|B}),此处缺失 | … | — |
| T059 | 打码占位 | ******(疑似敏感值,可在设置中关闭打码) | ****** | E18 |
| T060 | 设置标题 | Config Diff | — | contributes.configuration |

## 四、设置项文案(节选)

| key | 中文 | 默认 |
| --- | --- | --- |
| configDiff.defaultGrouping | 结果默认分组方式 | "file" |
| configDiff.env.caseInsensitive | .env 键忽略大小写 | false |
| configDiff.maskSecrets | 打码疑似敏感值 | true |
| configDiff.maxRenderRows | 报告最大渲染行数(超过启用虚拟滚动) | 5000 |
| configDiff.showIdenticalByDefault | 默认显示一致键 | false |
