# 02 · 组件规格与解剖(Component Specs)

> 每个组件给:定位 / 解剖结构 / 规格 / 状态 / 数据契约 / 交互 / 对应图纸 / 边界情况。
> 尺寸单位 px;颜色一律引 tokens 角色(见 01 §五),不出现 hex。

---

## C1 · 活动栏入口(Activity Bar)

- **定位**:扩展在 VS Code 里的"门牌"。
- **结构**:容器 id `config-diff-explorer`,标题「配置对比」;24×24 自绘图标(两个方框 + 双向箭头,见 `assets/30-iconography.svg`)。
- **状态**:
  - 无活跃比较:无 badge;
  - 有活跃比较:ViewBadge = `stats.byStatus` 中 active 总数(err+mod+type+onlya+onlyb);
  - 比较中:badge 用 `Number` + 视图内进度条,不用旋转图标。
- **交互**:点击 → reveal 容器与差异视图。
- **图纸**:`assets/01-overview-layout.svg`。

## C2 · 侧栏「差异」视图(核心)

- **定位**:结果的唯一导航面(INV-5)。数据源 = DiffResult,渲染为原生 TreeView。
- **树结构**:`文件对 → 状态 → 键路径组 → 叶子键`(INV-6;默认按文件分组,◫ 切按状态后顶层=状态)。
- **行规格**(行高 22,缩进 8/级,图 `assets/03-tree-row-anatomy.svg`):

| 行类型 | 图标 | 标签 | 描述(右侧灰字) | 命令 | contextValue |
| --- | --- | --- | --- | --- | --- |
| 文件对 | 文件图标(按扩展名配色) | 文件名 | 活跃差异数 | 展开/折叠 | `file-pair` |
| 状态 | 状态 codicon + 状态色(INV-2) | 状态名 | 该组计数 | 折叠/展开 | `status-{st}` |
| 分组 | 文件夹 | 键段名 | 子计数 | — | `key-group` |
| 叶子 | 状态 codicon + 色 | 键末段 | 单行摘要(≤40 字符) | `vscode.diff` | `leaf-{st}` |

- **叶子摘要格式**:`A值 → B值`(mod)/ `A值 ⇄ B值`(type)/ `A值`(onlya)/ `B值`(onlyb)/ `A值 ≈ B值`(equ);超长 `…` 截断,悬停 title 显示全值。
- **行内动作**(hover 显示,≤2 个,官方红线):`⧉ 打开对比`、`⊘ 忽略`。`≈ 设为等价` 仅在报告表格与右键菜单(mod 行)。
- **状态**(`assets/04-tree-row-states.svg`):默认 / hover(背景 `list.hoverBackground`)/ selected(`list.activeSelectionBackground`,与 diff 联动)/ 过期(整行 60% 透明 + 顶部黄条,见 03 §边界 E12)/ 无结果(空态,见 C12)。
- **视图工具栏**(title actions,固定顺序):`◫ 分组切换`、`⟳ 刷新`、`⇄ 对调两侧`、`⏱ 历史`(QuickPick:最近 10 次比较,含收藏固定)。
- **图纸**:`02-sidebar-ia.svg`、`03`、`04`。

## C3 · 侧栏「对比规则」视图

- **定位**:规则的常驻查看/开关面(INV-4);添加按钮的落点之一。
- **行规格**(图 `assets/07-rules-view-anatomy.svg`):`[类型 pill] 规则描述(人话句) [开关]`。
  - 类型 pill 六种:文件配对 / 值等价 / 忽略 / 脚本(色同状态系:onlyb/equ/ign/kw-blue);
  - 描述 = 卡片句(`assets/07`):「当 键 = X 且 A 值 = Y → 视为等价」;
  - 开关:自绘 TreeItem 用 checkbox 语义(contextValue 切换 + `⚠ 必须自绘焦点环,INV-8`);
  - 无效规则(违反 Schema):**不出现在此列表**,只在 Webview 编辑器标红(INV-4:运行中规则永远可信)。
- **视图脚部常驻动作**:`+ 添加规则`(→ C8 向导)、`</> 编辑源码`(打开 rules.json)。
- **边界**:规则文件不存在 → 显示 Welcome 按钮「创建规则文件」(写入默认骨架 + Schema 引用);规则文件 JSON 语法错 → 视图顶部错误条 + 「打开文件」。

## C4 · 编辑器「键级 Diff」(vscode.diff + 虚拟文档)

- **定位**:键级看值的标准姿势;免费获得 gutter、F7、Next Change。
- **虚拟文档生成规范**(图 `assets/05-diff-view-anatomy.svg`):
  - 语言 id = 源文件类型(yaml/env/json/…);
  - 第 1 行固定注释:`// Config Diff · <文件名> · <键完整路径>`;
  - 类型差异:第 2 行 `// ⇄ 类型不同: <aT> (A) vs <bT> (B)`;
  - 规则等价:第 2 行 `// ≈ 视为等价 —— 命中规则: <rule.note 或描述>`;
  - 忽略:`// ⊘ 已忽略 —— 命中规则: …`;
  - 随后按键路径逐层缩进渲染上下文行,叶子行放值;
  - 单侧缺失:缺失侧在叶子位置放注释 `# 该键仅存在于左侧(A),此处缺失`。
- **左/右底色**:mod/type → 左 rem 右 ins;equ → 两侧 `--diff-equ` 紫;ign → 弱化灰;缺失行不加 diff 底色(避免误导)。
- **标签标题**:`<key>(值对比)`;打开时树中对应叶子同步 selected(联动规范见 03 §联动)。

## C5 · 编辑器「对比报告」(Webview,二期 P1)

- **定位**:键级扁平表格,过滤/搜索/导出。**唯一允许"密集表格"的表面。**
- **结构**(图 `assets/06-report-table-anatomy.svg`):工具条(文件芯片 + 状态过滤芯片×6 + ⚙ 规则抽屉 + 搜索框)→ 表头 → 行(状态 / 键路径 / 文件 / A 值 / B 值 / 操作)→ 展开详情(两侧值并排 + 动作)→ 底部元信息行。
- **规格**:行高 28;列宽最小值 状态 96 / 键 240 / 文件 96 / A、B 各 220 / 操作 96;<760px 隐藏文件列;值列 mono 12px,超长省略 + title;absent 显示 `— 不存在 —` 斜体。
- **性能**:≥1000 行虚拟化(INV-7);搜索防抖 180ms;渲染用 DocumentFragment 单次插入;>5000 行底部提示"已启用虚拟滚动"。
- **交互**:行点击展开(手风琴,同时只开一行);`⊙` 在树中定位(reveal);`⧉` 打开 diff;`≈`(mod 行)一键生成等价规则;`⊘/↺` 忽略/取消忽略;全部写回 rules.json 并重算(INV-4/3)。
- **无障碍**:过滤框 ↑↓ 进列表(`widgetNavigation` 惯例);行 `role="button"` + aria-expanded。

## C6 · 状态徽标系统

- **六态三重编码**(图 `assets/08-status-badges.svg`,色值见 01 §五):

| status | 图标(codicon) | 色 token | 文字 | 语义 |
| --- | --- | --- | --- | --- |
| mod | `edit` | gitDecoration.modified… | ≠ 值不同 | 同键值不等 |
| type | `symbol-parameter` | charts.orange | ⇄ 类型不同 | 同键类型不同 |
| onlya | `remove` | gitDecoration.deleted… | − 仅在 A | B 缺失 |
| onlyb | `add` | gitDecoration.added… | + 仅在 B | A 缺失 |
| equ | `check-all` | charts.purple | ≈ 规则等价 | 规则判定一致 |
| ign | `eye-closed` | disabledForeground | ⊘ 已忽略 | 规则跳过 |
| (err) | `error` | editorError.foreground | ⚠ 解析失败 | 文件级 |

- **规则**:徽标 = `图标 + 空格 + 文字`,1px currentColor 描边圆角 999;禁止只用色点。

## C7 · 规则卡片句文法(Webview 编辑器 / tooltip 用)

- 文法:`当 <条件1> 且 <条件2> … → <结论>`;条件值一律 `<code>` 等宽徽章;结论动词按类型着色:
  - 配对 → 「配对比较」;等价 → 「视为等价 / 宽化比较」;忽略 → 「跳过比较」;脚本 → 「由脚本判定」。
- 示例:`当 键 cache.redis.host 且 A 值 redis-dev.local 且 B 值 redis-prod.internal → 视为等价`。

## C8 · 添加规则向导(QuickPick/InputBox)

- **入口**(全部落到同一向导,A/B/C 一致):规则视图 `+ 添加规则`、报告行内 `≈/⊘`、规则视图空态按钮。**无命令面板引导(INV-10)**。
- **流程**(图 `assets/17-quickpick-anatomy.svg`):
  1. QuickPick 选类型(分隔线分「简单规则 / 进阶·JS」两组,默认悬停"值等价");
  2. 按类型 2–3 步 InputBox(值等价:A 值 → B 值 → 作用范围键模式,可跳过);忽略:glob → 确认;配对:左文件 → 右文件;脚本:输文件名 → 生成模板并打开;
  3. 完成写 rules.json → 自动重比较 → 结果中 ≈ 高亮受影响键 + 通知"已生效(可撤销)"(撤销 = 移除规则,10s 内有效)。
- **校验**:每步 InputBox 即时校验(如 glob 语法),错误显示在 QuickPick 下方,`Esc` 可退出不落盘。

## C9 · 进度与通知

- 比较进度:`withProgress({location: Notification, cancellable: true})`,文案「正在比较 2 个文件…」副行显示当前文件;**禁止模态框**。
- 完成通知:仅当结果与上次不同或有错误时弹;文案 `比较完成:14 处差异 · 1 规则等价`,动作「查看」「忽略此类提示」(记住选择)。
- 错误通知:解析失败等,给「打开文件」动作。

## C10 · 状态栏项

- 文案 `$(diff) N 处差异`,tooltip 三行明细(活跃/等价/忽略 + 时间 + 文件对);点击 → reveal 差异视图;无活跃比较时隐藏。图 `assets/18-statusbar-anatomy.svg`。

## C11 · 过滤芯片(报告 Webview)

- 六芯片:全部 / ≠ 值不同 / ⇄ 类型 / − 仅在 A / + 仅在 B / ≈ 规则等价 / ⊘ 已忽略;数字实时来自 stats(切规则后随 eff 重算);选中态 `button.background`。

## C12 · 空状态 / 错误 / 过期(图 `assets/19-empty-error-states.svg`)

| 态 | 触发 | 内容 | 主按钮 |
| --- | --- | --- | --- |
| Welcome(无比较) | 首次 | 三入口卡片(活动栏推荐/右键/进阶命令面板) | 选择两个项目… |
| 规则为空 | 规则视图 0 条 | 说明 + 示例 | 添加规则… / 创建规则文件… |
| 比较中 | — | 通知进度 + 取消 | 取消 |
| 解析错误 | 文件坏 | 文件级 ⚠ 节点 + 其余文件正常比较 | 打开文件 |
| 结果过期 | 比较后文件改动 | 视图顶部黄条「结果已过期 · 刷新」;树 60% 透明 | 刷新 |
| 双侧全一致 | 0 差异 | 树显示「✓ 完全一致(87 键)」+ 通知一次 | 查看…(显示一致键) |
