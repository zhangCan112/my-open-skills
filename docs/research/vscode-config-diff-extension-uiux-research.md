# VS Code 配置文件对比扩展 — UI/UX 设计调研

> 调研日期：2026-10-28
> 调研对象：一个在 VS Code 中**比较两个项目的配置文件**（JSON / YAML / TOML / .env / properties）的扩展的界面与交互设计。
> 比较语义：仅在项目 A 中存在的键（extra）／仅在项目 B 中存在的键（missing）／同键不同值（modified）／同键不同类型（type-diff）；必须支持嵌套键的展平与归并。
> 方法：全部结论均回溯到官方一手来源（code.visualstudio.com 官方文档、microsoft/vscode-extension-samples 官方示例仓库、微软官方 GitHub 仓库），扩展案例部分使用 Marketplace 页面与 GitHub README 作为一手近似来源，均附内联链接。

---

## 目录

1. [VS Code 扩展 UI 能力全景（官方 UX 指南）](#1-vs-code-扩展-ui-能力全景官方-ux-指南)
2. [Webview API 与 Webview UX 指南](#2-webview-api-与-webview-ux-指南)
3. [Tree View API：能力与适用场景](#3-tree-view-api能力与适用场景)
4. [内置 Diff 编辑器的"比较"交互范式](#4-内置-diff-编辑器的比较交互范式)
5. [同类扩展 UI 模式调研](#5-同类扩展-ui-模式调研)
6. [与"增/删/改"相关的主题颜色 token](#6-与增删改相关的主题颜色-token)
7. [无障碍（Accessibility）要求](#7-无障碍accessibility要求)
8. [vscode-webview-ui-toolkit 已弃用与当前官方推荐](#8-vscode-webview-ui-toolkit-已弃用与当前官方推荐)
9. [对本项目 UI/UX 设计的建议](#9-对本项目-uiux-设计的建议)

---

## 1. VS Code 扩展 UI 能力全景（官方 UX 指南）

来源：[UX Guidelines Overview](https://code.visualstudio.com/api/ux-guidelines/overview)

官方将 VS Code 的界面划分为"**容器（Containers）**"与"**条目（Items）**"两类：

| 容器 | 说明（摘译自官方） |
| --- | --- |
| Activity Bar | 核心导航面，扩展可贡献 View Container，点击后在 Primary Sidebar 中渲染 Views |
| Primary Sidebar | 渲染一个或多个 View（如 Explorer、Source Control） |
| Secondary Sidebar | 第二侧边栏，用户可拖拽 View 进去 |
| Editor | 编辑区，扩展可贡献 Custom Editors 或 Webview，也可贡献 Editor Actions |
| Panel | 底部面板，也可承载 View Container（终端/问题/输出默认在此） |
| Status Bar | 底部状态栏，左侧条目面向整个工作区，右侧条目面向当前活动文件 |

可贡献的"条目"包括：View（Tree View / Welcome View / Webview View）、View Toolbar 动作、Sidebar Toolbar 动作、Editor Toolbar 动作、Panel Toolbar 动作、Status Bar Item。

**通用 UI 元素**及其官方定位：

- **Command Palette**：注册命令即可出现，是"快速执行某功能"的标准入口（[同上](https://code.visualstudio.com/api/ux-guidelines/overview)）。
- **Quick Pick**：以多种方式捕获用户输入——单选、多选、自由文本（[同上](https://code.visualstudio.com/api/ux-guidelines/overview)；API 见 [Common Capabilities / Quick Pick](https://code.visualstudio.com/api/extension-capabilities/common-capabilities#quick-pick)）。
- **Notifications**：用于信息/警告/错误传达，也可承载进度（[同上](https://code.visualstudio.com/api/ux-guidelines/overview)）。
- **Webviews**：当需求超出 VS Code "原生" API 时展示自定义内容（[同上](https://code.visualstudio.com/api/ux-guidelines/overview)）。
- **Settings（contributes.configuration）**：让用户配置扩展选项（[同上](https://code.visualstudio.com/api/ux-guidelines/overview)）。

其他与本项目直接相关的基础能力（来源：[Common Capabilities](https://code.visualstudio.com/api/extension-capabilities/common-capabilities)）：

- `window.showOpenDialog`：打开系统文件选择器选择文件或文件夹 —— 适合"选择第二个项目目录"。
- `vscode.Progress` + `ProgressLocation`：进度可显示在通知区 / 源代码管理视图 / 窗口全局，也可以用 `ProgressLocation.View` 显示在某个视图内（视图内进度见 [Views UX 指南](https://code.visualstudio.com/api/ux-guidelines/views#views-with-progress)）。
- 三级通知 API：`showInformationMessage` / `showWarningMessage` / `showErrorMessage`（[同上](https://code.visualstudio.com/api/extension-capabilities/common-capabilities#display-notifications)）。
- 工作区状态存储 `workspaceState` / `globalState`：适合记住"最近一次比较的两个项目"历史（[同上](https://code.visualstudio.com/api/extension-capabilities/common-capabilities#data-storage)）。

---

## 2. Webview API 与 Webview UX 指南

### 2.1 官方对"何时使用 Webview"的态度（非常克制）

来源：[Webview API 指南](https://code.visualstudio.com/api/extension-guides/webview)

官方原话（摘译）："Webview 应该**克制使用**，只在 VS Code 原生 API 力所不及的时候使用。Webview 资源开销大、运行在与扩展分离的独立上下文中，设计不佳的 Webview 很容易显得与 VS Code 格格不入。" 使用前自问：

- 这个功能真的需要活在 VS Code 里吗？
- Webview 是实现该功能的唯一方式吗？能否用常规 VS Code API？
- 它带来的用户价值足以抵消高昂的资源成本吗？

[Webviews UX 指南](https://code.visualstudio.com/api/ux-guidelines/webviews) 给出的 Do/Don't 清单：

**✔️ Do**

- 只在绝对必要时使用 Webview
- 在语境合适的时机才激活扩展
- 只为活动窗口打开 Webview
- 确保视图中所有元素**可主题化**（参考 [webview-view-sample 的 main.css](https://github.com/microsoft/vscode-extension-samples/blob/main/webview-view-sample/media/main.css) 与[颜色 token 文档](https://code.visualstudio.com/api/references/theme-color)）
- 确保视图遵循无障碍指引（颜色对比度、ARIA 标签、键盘导航）
- 在工具栏和视图中使用命令动作

**❌ Don't**

- 用于推广（升级、赞助等）
- 用于向导（wizard）式流程
- 在每个窗口都打开
- 在扩展更新时弹出（应改用通知询问）
- 添加与编辑器/工作区无关的功能
- 重复既有功能（欢迎页、设置、配置等）

### 2.2 Webview 核心机制（对实现有直接约束的部分）

来源：[Webview API 指南](https://code.visualstudio.com/api/extension-guides/webview)

- **三种宿主形态**：`createWebviewPanel`（编辑器中的独立面板）、Custom Editor、`WebviewView`（放在侧边栏/面板中的视图，见官方示例 [webview-view-sample](https://github.com/microsoft/vscode-extension-samples/tree/main/webview-view-sample)）。
- **消息传递**：Webview 内脚本无 VS Code API 权限；扩展→Webview 用 `webview.postMessage()`，Webview→扩展必须在页面内调用 `acquireVsCodeApi()`（**每个会话只能调用一次**，且不得泄漏到全局）再 `postMessage`。
- **本地资源**：Webview 隔离环境不能直接访问本地文件，必须用 `asWebviewUri` 转换，且默认只允许扩展安装目录与当前工作区；`localResourceRoots` 应尽可能收紧。
- **CSP**：必须加 `<meta http-equiv="Content-Security-Policy">`，推荐 `default-src 'none'` 后按需放行 `${webview.cspSource}`；内联脚本/样式应外置。文件内容、路径、用户设置等用户输入必须做 HTML 转义（对比结果的键名/值渲染进 DOM 前要转义）。
- **状态持久化**：Webview 切到后台会销毁 DOM；官方推荐**无状态设计 + `getState`/`setState`**，而不是 `retainContextWhenHidden`（后者内存开销大，仅作最后手段）。`WebviewPanelSerializer` 可让面板跨窗口重启恢复。→ 对"几千条 diff 结果"的场景意味着：结果数据保存在扩展侧，Webview 只保存滚动位置/过滤条件等轻量状态。
- **生命周期**：`onDidDispose` 清理；`reveal()` 可将已有面板带到前台（可做"单例面板"）。

### 2.3 Webview 主题化：CSS 变量（官方清单入口）

来源：[Webview API 指南 / Theming webview content](https://code.visualstudio.com/api/extension-guides/webview#theming-webview-content)

- VS Code 会给 Webview 的 `body` 加主题类别类：`vscode-light` / `vscode-dark` / `vscode-high-contrast`（另有 high contrast light 变体随主题 id 出现），可用 CSS 按类别覆盖样式。
- 所有[主题颜色](https://code.visualstudio.com/api/references/theme-color)在 Webview 中以 **CSS 变量**注入：点号换横杠、加 `--vscode-` 前缀，例如 `editor.foreground` → `var(--vscode-editor-foreground)`；`charts.red` → `var(--vscode-charts-red)`。**完整可用列表即 Theme Color Reference 页面的全部 token**。
- 字体变量：`--vscode-editor-font-family` / `--vscode-editor-font-weight` / `--vscode-editor-font-size`（取自用户 `editor.fontFamily` 等设置）→ 对比表格中的值列应用这些变量渲染等宽字体。
- 特殊场景可用 `body[data-vscode-theme-id="..."]` 针对单一主题写 CSS。
- 有官方 Marketplace 扩展提供这些 CSS 变量的 IntelliSense 补全（connor4312.css-theme-completions）。

### 2.4 Webview 无障碍钩子

来源：[Webview API 指南 / Accessibility](https://code.visualstudio.com/api/extension-guides/webview#accessibility)

- 用户使用屏幕阅读器时，Webview 的 `body` 会加上 `vscode-using-screen-reader` 类；用户偏好减少动效时加上 `vscode-reduce-motion` 类。Webview 内容应观察这两个类并相应调整渲染。

---

## 3. Tree View API：能力与适用场景

### 3.1 基础

来源：[Tree View 指南](https://code.visualstudio.com/api/extension-guides/tree-view)

- 通过 `contributes.views` 把视图放进 `explorer` / `debug` / `scm` / `test` 或自定义 View Container（`contributes.viewsContainers`，可在 Activity Bar 或 Panel）。
- 实现 `TreeDataProvider` 的 `getChildren` / `getTreeItem`；`collapsibleState` 控制默认展开。
- `onDidChangeTreeData` 事件 + `refresh()` 命令实现刷新；把带 icon 的命令放进 `view/title`（`"group": "navigation"`）即成为视图标题栏按钮。
- `TreeItem.contextValue` + `when` 表达式（`viewItem == xxx`）控制**每类节点**的右键菜单/内联按钮。
- 空视图可用 `viewsWelcome` 提供引导内容："按惯例，独占一行的链接会渲染成按钮"。
- 声明视图贡献后，`onView:${viewId}` 自动成为激活事件，用户打开视图才激活扩展——符合官方"按需激活"要求。

官方示例：[tree-view-sample](https://github.com/microsoft/vscode-extension-samples/tree/main/tree-view-sample/README.md)（含 view/title、view/item/context、contextValue 用法）。

### 3.2 TreeView 对象能力（createTreeView vs registerTreeDataProvider）

来源：[VS Code API 参考 / TreeView](https://code.visualstudio.com/api/references/vscode-api#TreeView)

用 `window.createTreeView`（而非 `registerTreeDataProvider`）可获得 `TreeView` 对象，支持：

- **`reveal(element, {select, focus, expand})`**：在树中定位并显示某元素（要求 DataProvider 实现 `getParent`；`expand` 最多展开 3 层）。→ 用于"点击 diff 表格行后，在侧边树中定位对应键"。
- **`selection` / `onDidChangeSelection`**：读取/监听选中项；`TreeViewOptions.canSelectMany` 开启多选，多选状态下执行命令时第二个参数是全部选中项数组。
- **`badge`（ViewBadge）**：视图标题上的数字徽标 → 天然适合显示"差异总数"，甚至可按类别分层（参考 SCM 视图的 changes 计数徽标用法）。
- **`message` / `title` / `description`**：视图内提示消息与标题描述。
- **`onDidChangeVisibility` / `onDidExpandElement` / `onDidCollapseElement`**：可见性与展开事件。
- **拖拽**：`TreeViewOptions.dragAndDropController`（`TreeDragAndDropController`，配合 `handleDrag`/`handleDrop` 与 `DataTransfer` MIME 类型）可为树启用拖放。
- **复选框**：`TreeCheckboxChangeEvent` 与 `manageCheckboxStateManually`（较新的复选框能力）。

### 3.3 Tree View 的 UX 红线

来源：[Views UX 指南](https://code.visualstudio.com/api/ux-guidelines/views)

**✔️ Do**：显示数据用 Tree View；每个 View 配图标；视图数量与名称长度尽量精简；树条目用描述性标签与产品图标区分类型。

**❌ Don't**：

- **不要把树条目当"单击执行命令的按钮"**（应通过 `TreeItem.command` 打开内容，动作放菜单）
- 避免不必要的深层嵌套（"几层文件夹/条目对多数场景是好的平衡"）
- 单个条目动作不超过 3 个

### 3.4 TreeView vs Webview 的官方选择准则

综合三处官方表述：

1. Webview 只在原生 API 不足时用，且"能用常规 API 就用常规 API"（[Webview 指南](https://code.visualstudio.com/api/extension-guides/webview#should-i-use-a-webview)）。
2. "显示数据用 Tree View"、"限制自定义 Webview View 的使用"、"不要用 Activity Bar 项去打开编辑器里的 Webview"（[Views UX 指南](https://code.visualstudio.com/api/ux-guidelines/views)）。
3. Webview 适用判例：官方 Pull Request 扩展"树视图列出 PR 列表 + Webview 做 PR 详情页"（[Webviews UX 指南示例](https://code.visualstudio.com/api/ux-guidelines/webviews#webview-examples)）→ **"树负责导航/概览，Webview 负责富详情"是微软自家扩展的分工范式**。

---

## 4. 内置 Diff 编辑器的"比较"交互范式

### 4.1 官方比较入口（用户已有的心智模型）

来源：[Basic Editing / Compare files](https://code.visualstudio.com/docs/editing/codebasics#compare-files)

- 对活动文件：`File: Compare Active File With...`（命令面板选另一文件）、`File: Compare Active File with Clipboard`、`File: Compare Active File with Saved`。
- 对任意两文件：在 Explorer **右键第一份文件 → Select for Compare**，再**右键第二份文件 → Compare with Selected**——这是 VS Code 用户"比较两个东西"的标准两步心智模型。
- 还有 `File: Compare New Untitled Text Files`（两个空编辑器对比）与命令行 `code --diff a b`。

> 设计启示：我们的扩展应复用这一心智——"先标记 A，再对 B 执行比较"，而不是发明新流程。

### 4.2 Diff 编辑器的视觉语言

- 视觉 token 全部由主题颜色承载：`diffEditor.insertedTextBackground` / `removedTextBackground`（行内增删底色，官方注明"必须非不透明"）、`diffEditor.insertedLineBackground` / `removedLineBackground`（整行底色）、`diffEditor.border`（两侧编辑器分隔边框）、`diffEditor.diagonalFill`（并排视图中空侧的对角线填充）、`diffEditorGutter.insertedLineBackground` / `removedLineBackground`（行号槽）、`diffEditorOverview.insertedForeground` / `removedForeground`（概览标尺）。
  来源：[Theme Color Reference](https://code.visualstudio.com/api/references/theme-color)
- 行号槽的增/删/改着色另有独立一组：`editorGutter.addedBackground` / `deletedBackground` / `modifiedBackground`（及 `*SecondaryBackground`）（[同上](https://code.visualstudio.com/api/references/theme-color)）。
- "Next Change"导航：差异编辑器支持在变更间跳转；无障碍方面官方提供 Accessible Diff Viewer，命令为 `editor.action.accessibleDiffViewer.next` / `.prev`，以统一 patch 格式呈现变更，`Enter` 返回编辑器对应行（来源：[Accessibility 文档 / Diff editor accessibility](https://code.visualstudio.com/docs/configure/accessibility/accessibility#diff-editor-accessibility)）。

### 4.3 树节点打开比较视图的官方推荐姿势

来源：[VS Code API 参考 / TreeItem.command](https://code.visualstudio.com/api/references/vscode-api#TreeItem)

官方明确建议："当树条目要在编辑器中打开某内容时，请使用 `vscode.open` 或 `vscode.diff` 作为命令 ID……这能保证打开的编辑器与其他内置树的表现一致。" → 我们的侧边树中每个差异键条目，可以直接用 `vscode.diff`（左 URI = A 侧值，右 URI = B 侧值）打开原生 diff 编辑器，天然获得并排视图、gutter 着色、Next Change 导航与无障碍查看器。

---

## 5. 同类扩展 UI 模式调研

### 5.1 Partial Diff（ryu1kn）—— 纯命令驱动，复用内置 diff

- 仓库：https://github.com/ryu1kn/vscode-partial-diff ；Marketplace：https://marketplace.visualstudio.com/items?itemName=ryu1kn.partial-diff
- **UI 形态**：无自定义视图。4 个命令（`Select Text for Compare` → `Compare Text with Previous Selection` / `Compare Text with Clipboard` / `Compare Text in Visible Editors`），比较结果直接用 VS Code 内置 diff 编辑器展示；命令可配置进右键菜单（`partialDiff.commandsOnContextMenu`）。
- **启示**：完全沿用了官方 "Select for Compare → Compare with Selected" 的两步模型（见 [4.1](#41-官方比较入口用户已有的心智模型)）；零自定义 UI、零主题适配成本。

### 5.2 Compare Folders（moshfeu）—— Activity Bar 视图容器 + 树视图 + 内置 diff

- 仓库：https://github.com/moshfeu/vscode-compare-folders ；Marketplace：https://marketplace.visualstudio.com/items?itemName=moshfeu.compare-folders
- **UI 形态**（README）：
  - 入口四选一：命令面板（`Compare a folder against workspace` / `Choose 2 folders and compare`）、Activity Bar 上的专属 Panel、Explorer 多选右键 `Compare selected folders`、`Pick from recent compares` 历史。
  - 结果区是侧边栏中的三个树视图分区：**Differences / Only in My Folder / Only in Compared Folder**——正是"modified / 只在 A / 只在 B"三类语义。
  - 视图工具栏：历史、Swap Sides（对调两侧）、Refresh；**List/Tree 两种展示模式可切换**；条目动作：Dismiss、Take My File / Take Compared File、Exclude from Comparison。
  - 点击某文件差异时用内置 diff 编辑器并排展示；`showFileCount` 设置在分区标题显示数量。
  - 支持 `COMPARE_FOLDERS=DIFF code dirA dirB` 环境变量从 CLI 启动并直接展示差异视图。
- **启示**：这是与本命题语义最接近的成熟案例——"三分类 + 树视图 + 内置 diff"的组合已被验证；"树/列表双布局切换"与"最近比较历史"值得直接借鉴。

### 5.3 Diff Folders（L13RARY）—— 面板 + 收藏组 + 快捷键体系

- Marketplace：https://marketplace.visualstudio.com/items?itemName=L13RARY.l13-diff
- **UI 形态**（Marketplace 页）：`New Diff Panel` 打开差异面板；支持 Favorites/Groups（收藏常用目录对，可导出/导入 JSON）、Search / Filter / SelectList 与 Navigator、鼠标与键盘快捷键、自定义键绑定、Output Channel 输出比较日志。
- **启示**："收藏比较对（favorites）"解决"两个项目反复比"的高频场景；把目录选择做成持久对象而非一次性动作。

### 5.4 JSON Diff Studio（ThrottleWorks）—— Webview 全家桶式键级对比表

- Marketplace：https://marketplace.visualstudio.com/items?itemName=ThrottleWorksStudio.json-diff-studio
- **UI 形态**（Marketplace 页）：Activity Bar 图标 + 命令 + 快捷键打开 Webview；Compare 模式把每份 JSON 展平后渲染成**表格**：`Path` 列 + 每面板一列 + `Status` 徽标（`Same` / `Different` / `+ Added` / `- Removed`）；顶部**过滤条按类别显示实时计数**，点标签即时过滤；另有 Key/Value 搜索框；性能上限：diff 行数封顶 5000、树节点封顶 2000（超出显示提示）、搜索 180ms 防抖、`DocumentFragment` 单次 DOM 插入。
- **启示**：键级对比的**表格 + 状态徽标 + 计数过滤条**范式直接对应本命题的 extra/missing/modified/type 四类语义；它也示范了 Webview 路线必须自行处理大数据量上限与防抖。

### 5.5 其他可参考

- **JSON Sort & Compare**（https://github.com/pharzan/json-sort-compare-vscode ）：比较前先按键排序 JSON，让差异更易读——键归一化预处理思路。
- **SemanticDiff**（https://semanticdiff.com/blog/visual-studio-code-compare-files ）：语法感知 diff，JSON 对比时"左侧独有的键标红、右侧独有的键标绿"（https://semanticdiff.com/online-diff/json ）。

### 5.6 小结：同类扩展的四种 UI 路线

| 路线 | 代表 | 优点 | 代价 |
| --- | --- | --- | --- |
| 纯命令 + 内置 diff | Partial Diff | 零适配、完全原生 | 只能行级文本对比，无法做键级语义 |
| Activity Bar 树视图 + 内置 diff | Compare Folders、Diff Folders | 原生观感、目录级三类语义、可导航 | 键级（嵌套键）语义需自建树模型 |
| Webview 交互式面板 | JSON Diff Studio | 键级表格/过滤/搜索自由度最大 | 主题化、无障碍、性能上限全部自理 |
| 树（导航）+ Webview（详情）混合 | 微软 PR 扩展范式（[来源](https://code.visualstudio.com/api/ux-guidelines/webviews#webview-examples)） | 两者取长 | 实现复杂度最高 |

---

## 6. 与"增/删/改"相关的主题颜色 token

来源（完整清单）：[Theme Color Reference](https://code.visualstudio.com/api/references/theme-color)。以下 token 在 Webview 中均可用 `var(--vscode-…)` 形式引用（见 [2.3](#23-webview-主题化css-变量官方清单入口)）。

### 6.1 diff 编辑器系（并排/内联差异的"正统"用色）

| Token | 官方含义 |
| --- | --- |
| `diffEditor.insertedTextBackground` / `insertedTextBorder` | 插入文本底色（官方注明必须非不透明）/描边 |
| `diffEditor.removedTextBackground` / `removedTextBorder` | 删除文本底色/描边 |
| `diffEditor.insertedLineBackground` / `removedLineBackground` | 插入行/删除行整行底色 |
| `diffEditor.border` | 两侧编辑器分隔边框 |
| `diffEditor.diagonalFill` | 并排视图空侧对角线填充 |
| `diffEditorGutter.insertedLineBackground` / `removedLineBackground` | 行号槽插入/删除行底色 |
| `diffEditorOverview.insertedForeground` / `removedForeground` | 概览标尺插入/删除前景色 |
| `editorGutter.addedBackground` / `deletedBackground` / `modifiedBackground`（含 Secondary） | 行号槽新增/删除/修改底色 |

### 6.2 语义状态系（文件/条目级别的"增删改名"）

| Token | 官方含义 |
| --- | --- |
| `gitDecoration.addedResourceForeground` | 新增 Git 资源的标签前景色（SCM 视图同款绿色语义） |
| `gitDecoration.modifiedResourceForeground` | 修改资源前景色 |
| `gitDecoration.deletedResourceForeground` | 删除资源前景色 |
| `gitDecoration.renamedResourceForeground` | 重命名/复制资源前景色 |
| `gitDecoration.conflictingResourceForeground` | 冲突资源前景色 |
| `list.errorForeground` | 含错误的列表条目前景色 |
| `editorError.foreground` / `border` / `background` | 错误波浪线/边框/文本底色 |
| `editorWarning.foreground` / `border` / `background` | 警告同上 |

### 6.3 中性/图表色系（不预设语义，适合"类型差异"等自定义分类）

| Token | 官方含义 |
| --- | --- |
| `charts.red` / `charts.green` / `charts.yellow` / `charts.blue` / `charts.orange` / `charts.purple` | 图表中对应颜色元素的用色 |
| `list.highlightForeground` / `list.focusHighlightForeground` | 列表/树中搜索命中高亮前景 |
| `list.activeSelectionBackground` / `list.dropBackground` | 列表选中底色 / 拖放目标底色 |
| `notifications.background` / `border` | 通知底色/边框 |
| `statusBar.background` / `foreground` | 状态栏底/前景 |
| `focusBorder` | 焦点元素整体边框（键盘导航的可见焦点） |
| `input.background` | 输入框底色 |

### 6.4 官方语义约定小结

- **"加=绿、删=红、改=黄/橙"** 在 VS Code 中由 `diffEditor.*`、`editorGutter.*`、`gitDecoration.*` 三组 token 共同固化；扩展 UI 应复用同组 token 而非硬编码色值，才能自动适配所有主题与高对比度主题。
- 状态栏警告/错误底色（`statusBarItem.warningBackground` 等）被官方定性为"最后手段"，因为过于抢眼（来源：[Status Bar UX 指南](https://code.visualstudio.com/api/ux-guidelines/status-bar#error-and-warning-status-bar-items)）。

---

## 7. 无障碍（Accessibility）要求

来源：[VS Code Accessibility 文档](https://code.visualstudio.com/docs/configure/accessibility/accessibility)、[Webview 指南](https://code.visualstudio.com/api/extension-guides/webview#accessibility)、[Webviews UX 指南](https://code.visualstudio.com/api/ux-guidelines/webviews)

1. **键盘导航是硬要求**：所有工作台 UI 支持 Tab 导航（`Tab`/`Shift+Tab`），焦点元素有可见指示环（`focusBorder`）；工具栏/标签列表只占一个 Tab 停靠点，内部用方向键（[同上 / Tab navigation](https://code.visualstudio.com/docs/configure/accessibility/accessibility#tab-navigation)）。
2. **Webview 例外**：WebView 不参与统一 Tab 序，官方推荐用户用 `Focus Next/Previous Part` 在 Webview 与工作台其他部分之间移动；Webview **内部**则必须自行做好 `tabindex`/焦点管理——UX 指南明确要求"确保视图遵循无障碍指引（颜色对比度、ARIA 标签、键盘导航）"（[Webviews UX 指南](https://code.visualstudio.com/api/ux-guidelines/webviews)）。
3. **输入框→结果列表的统一导航键**：`widgetNavigation.focusNext/Previous` 在搜索框与其结果之间移动（如 Extensions 视图、Problems 面板），我们的"键过滤框 → 结果表"应遵循同一模式（[Accessibility 文档 / Input control and result navigation](https://code.visualstudio.com/docs/configure/accessibility/accessibility#input-control-and-result-navigation)）。
4. **屏幕阅读器**：Webview `body` 会带 `vscode-using-screen-reader` 类，可据此切换渲染；`vscode-reduce-motion` 类用于减少动效（[Webview 指南 / Accessibility](https://code.visualstudio.com/api/extension-guides/webview#accessibility)）。
5. **高对比度**：官方要求 Webview 在三种主题类别（light/dark/high-contrast）下都必须可用，并强调"务必在高对比度模式下测试"（[Webview 指南 / Theming](https://code.visualstudio.com/api/extension-guides/webview#theming-webview-content)）；系统级 High Contrast 主题在所有平台可用（[Accessibility 文档](https://code.visualstudio.com/docs/configure/accessibility/accessibility#high-contrast-theme)）。
6. **色盲友好**：只用红/绿区分增删对红绿色盲用户不可靠；官方收录的色盲友好主题（GitHub、Gotthard、Blinds 等）以及"用互补色、辅以图标/文字"是推荐做法（[Accessibility 文档 / Color vision accessibility](https://code.visualstudio.com/docs/configure/accessibility/accessibility#color-vision-accessibility)）。→ diff 状态应**同时用图标/文字徽标承载**，不能只靠颜色。
7. **可参考的官方标杆**：内置 Accessible Diff Viewer 以统一 patch 格式逐行朗读差异（[Accessibility 文档 / Diff editor accessibility](https://code.visualstudio.com/docs/configure/accessibility/accessibility#diff-editor-accessibility)）；树条目可携带 `accessibilityInformation`（[VS Code API 参考](https://code.visualstudio.com/api/references/vscode-api#TreeItem)）。

---

## 8. vscode-webview-ui-toolkit 已弃用与当前官方推荐

- **结论：已弃用并归档，新项目不应使用。**
  - 组件库 README 顶部警告（[仓库 README](https://github.com/microsoft/vscode-webview-ui-toolkit)）："The Webview UI Toolkit for VS Code will be deprecated on January 1, 2025."
  - 弃用公告 issue #561（https://github.com/microsoft/vscode-webview-ui-toolkit/issues/561 ）：因上游 FAST 项目废弃 FAST Foundation 且无重写资源，项目于 **2025-01-06 归档为只读**；NPM 包、主仓库、示例仓库同步弃用。
  - 维护者的收尾说明（同 issue 评论）：继续使用意味着"无补丁路径的 bug/安全风险"，且无法跟进 VS Code 未来 UI 演进；**VS Code 原生 UI 组件与源码深度耦合、无法抽出复用**。
- **当前怎么做 Webview UI**（同一 issue 中维护者总结的社区落点 + 官方文档）：
  1. 官方立场：Webview UI 责任回归扩展作者，按 [Webview UX 指南](https://code.visualstudio.com/api/ux-guidelines/webviews) 与 [Theme Color token](https://code.visualstudio.com/api/references/theme-color) 用**原生 HTML/CSS + `--vscode-*` CSS 变量**自行实现（[Webview 指南 / Theming](https://code.visualstudio.com/api/extension-guides/webview#theming-webview-content)）。
  2. 维护者点名认可的两个社区方案：**VS Code Elements**（https://vscode-elements.github.io/ ，基于 Lit 的 VS Code 风格 Web Components）与 **VS Code React UI（vscrui）**（https://github.com/estruyf/vscrui ，React 实现，WIP）。
  3. 图标：官方 Codicons（@vscode/codicons）仍是工作台图标配套资源（视图/命令 icon 均可引用，见 [Views UX 指南](https://code.visualstudio.com/api/ux-guidelines/views) "Use existing icons when possible"）。

---

## 9. 对本项目 UI/UX 设计的建议

### 9.1 推荐交互流程

结合官方两步比较心智（[4.1](#41-官方比较入口用户已有的心智模型)）与 Compare Folders 的成熟范式（[5.2](#52-compare-foldersmoshfeu--activity-bar-视图容器--树视图--内置-diff)），建议如下主流程：

1. **选择 A、B 两个项目（多入口收敛到同一状态）**
   - 命令面板：`Config Diff: Compare Two Projects…` → 两次 `showOpenDialog` 选目录（[Common Capabilities / File Picker](https://code.visualstudio.com/api/extension-capabilities/common-capabilities#file-picker)）；
   - Explorer 右键：对文件夹贡献 `Select for Compare` / `Compare with Selected` 风格的菜单项（沿用 [4.1](#41-官方比较入口用户已有的心智模型) 心智）；
   - 收藏的"项目对"（借鉴 Diff Folders favorites，[5.3](#53-diff-foldersl13rary--面板--收藏组--快捷键体系)），用 `globalState` 持久化最近比较历史（[Common Capabilities / Data Storage](https://code.visualstudio.com/api/extension-capabilities/common-capabilities#data-storage)）。
2. **选择要对比的文件组**：自动嗅探两侧同名配置文件（`appsettings.json`、`config.yaml`、`.env` 等），在 Quick Pick 中多选（`canSelectMany`，[QuickPick API](https://code.visualstudio.com/api/references/vscode-api#QuickPick)），用分隔符（QuickPickSeparator）按文件分组（[Quick Picks UX 指南](https://code.visualstudio.com/api/ux-guidelines/quick-picks#using-separators)）。
3. **比较执行**：用 `withProgress` + `ProgressLocation`（通知区或视图内）报告进度（[Common Capabilities / Progress API](https://code.visualstudio.com/api/extension-capabilities/common-capabilities#progress-api)；视图内进度见 [Views UX](https://code.visualstudio.com/api/ux-guidelines/views#views-with-progress)）。大文件比较应是可取消的。
4. **结果主展示区 = Activity Bar 自有 View Container 中的树视图**（按下述三类分组），树节点数（ViewBadge）显示差异总数：
   - `Modified`（同键不同值）/ `Type Changed`（同键不同类型）合并为"Differences"分区或并列两个分区；
   - `Only in <项目 A>`（extra）与 `Only in <项目 B>`（missing）各自独立分区——这是 Compare Folders 验证过的三/四分区模型（[5.2](#52-compare-foldersmoshfeu--activity-bar-视图容器--树视图--内置-diff)）；
   - 嵌套键按原始层级建树（沿用配置文件自身的嵌套结构作为树层级，避免官方警告的"不必要深层嵌套"——因为我们展示的是数据本身的层级，[Views UX](https://code.visualstudio.com/api/ux-guidelines/views#tree-views)），叶子节点显示 `key: A值 → B值` 摘要。
5. **键级详情 = 内置 diff 编辑器**：树叶子节点 `command` 用官方推荐的 `vscode.diff` 打开"两侧值"的并排对比（把单个值生成为虚拟文本文档），天然获得主题着色、gutter、Next Change 与无障碍查看器（[4.3](#43-树节点打开比较视图的官方推荐姿势)、[4.2](#42-diff-编辑器的视觉语言)）。类型差异在 diff 内容头部加一行注释说明 `string → number`。
6. **顶层摘要 = Webview 面板（可选增强，第二期）**：当用户需要"全部键的扁平表格 + 计数过滤 + 搜索"时，用 Webview 渲染 JSON Diff Studio 式的状态徽标表格（[5.4](#54-json-diff-studiothrottleworks--webview-全家桶式键级对比表)）；树与 Webview 通过 `reveal` 双向联动（[3.2](#32-treeview-对象能力createtreeview-vs-registertreedataprovider)）。这样既守住"Webview 只做原生 API 做不到的富视图"的官方红线（[2.1](#21-官方对何时使用-webview-的态度非常克制)），又符合"树导航 + Webview 详情"的微软自家范式（[3.4](#34-treeview-vs-webview-的官方选择准则)）。
7. **收尾动作**：状态栏项（左侧，短文本，如 `$(diff) 37 diffs`）显示当前比较摘要，点击聚焦结果视图（状态栏规范：左侧放工作区级条目、短标签、不加自定义颜色，[Status Bar UX](https://code.visualstudio.com/api/ux-guidelines/status-bar)）；完成/异常用通知，遵循官方通知决策树（能不弹就不弹、合并通知、提供"Do not show again"，[Notifications UX](https://code.visualstudio.com/api/ux-guidelines/notifications)）。

**面对"数千条差异键"的导航策略**（对应 JSON Diff Studio 用 5000 行上限 + 过滤条解决的问题）：

- 分区标题计数（`showFileCount` 式，[5.2](#52-compare-foldersmoshfeu--activity-bar-视图容器--树视图--内置-diff)）+ 视图 badge 总数；
- 树内置过滤器（`TreeView.message` + 视图标题栏过滤命令）与"仅显示 modified / 仅显示 type-diff"切换（用 `contextValue` + `when` 控制条目动作，[3.1](#31-基础)）;
- Quick Pick 全局搜索键路径（`Config Diff: Go to Key…`）+ `TreeView.reveal` 精确定位（[3.2](#32-treeview-对象能力createtreeview-vs-registertreedataprovider)）；
- Webview 表格（第二期）承担"键/值搜索 + 类别过滤 tab + 滚动虚拟化"。

### 9.2 主题 token 使用建议

来源：[Theme Color Reference](https://code.visualstudio.com/api/references/theme-color)、[Webview Theming](https://code.visualstudio.com/api/extension-guides/webview#theming-webview-content)

- **绝不硬编码颜色**。全部用 `var(--vscode-…)`，使主题/高对比度自动适配。
- 语义映射（与内置 diff 一致的"增删改"语言）：
  - `Only in A`（extra，删除语义）→ `gitDecoration.deletedResourceForeground`（条目前景）或 `diffEditor.removedTextBackground`（行底色，记得叠层时保持半透明）；
  - `Only in B`（missing，新增语义）→ `gitDecoration.addedResourceForeground` / `diffEditor.insertedTextBackground`；
  - 值不同（modified）→ `gitDecoration.modifiedResourceForeground` 或 `editorGutter.modifiedBackground`；
  - **类型差异**：内置没有专属 token，用 `charts.yellow`（或 `charts.orange`）+ 专用图标 + 文字徽标 `string→number`，避免与 error/warning 语义混淆；
  - 结构性异常（解析失败等）才可用 `editorError.foreground` / `list.errorForeground`。
- Webview 基础外观：文字 `--vscode-foreground`、背景 `--vscode-editor-background`（表格容器可用 `--vscode-notifications.background` 区块感）、等宽值列 `--vscode-editor-font-family/-size`、按钮 `--vscode-button-background/-foreground` 与次级 `--vscode-button-secondaryBackground/-foreground`、输入框 `--vscode-input.background`、搜索命中高亮 `--vscode-list.highlightForeground`、焦点环 `--vscode-focusBorder`。
- 高对比度与色盲：状态一律"颜色 + 图标（Codicons）+ 文字徽标"三重编码（[7](#7-无障碍accessibility要求) 第 6 条）；发布前在 High Contrast 主题下实测（[2.3](#23-webview-主题化css-变量官方清单入口)）。

### 9.3 五个具体可落地的 UX 模式

1. **"Select for Compare" 两步标记模式**：Explorer 右键菜单提供 `Select Project A for Config Diff` → `Compare with Selected Project`（外加对单文件的版本），复用官方比较心智（[4.1](#41-官方比较入口用户已有的心智模型)），零学习成本。
2. **"三分区树 + 计数徽标 + 树/列表切换"结果视图**：Modified / Only in A / Only in B（Type Changed 可并入 Modified 加徽标）分区树；视图 badge 显示总数、分区标题显示各类计数；工具栏提供 Refresh / Swap Sides / List⇄Tree 切换 / 历史下拉——全部照搬 Compare Folders 已验证的布局（[5.2](#52-compare-foldersmoshfeu--activity-bar-视图容器--树视图--内置-diff)），并用 `TreeItem.command = vscode.diff` 打开键级对比（[4.3](#43-树节点打开比较视图的官方推荐姿势)）。
3. **"计数过滤条 + 键路径搜索 + reveal 联动"的大结果导航**：树顶提供类别过滤（显示 `37 modified / 12 type / 5 only-in-A / 9 only-in-B`），Quick Pick 模糊搜索完整键路径后 `TreeView.reveal` 跳转（[3.2](#32-treeview-对象能力createtreeview-vs-registertreedataprovider)）；Webview 表格路线则参考 JSON Diff Studio 的过滤 tab 实时计数与 180ms 防抖搜索（[5.4](#54-json-diff-studiothrottleworks--webview-全家桶式键级对比表)）。
4. **"收藏项目对 + 最近比较"持久化**：把常用项目对存为 favorites（`globalState`），视图 Welcome 内容放"选择两个项目 / 从历史选择"两个主按钮（Welcome 规范：独占一行的链接渲染为按钮，主动作用才用按钮，[Views UX](https://code.visualstudio.com/api/ux-guidelines/views#welcome-views)、[3.1](#31-基础)），历史经 `Pick from recent compares` Quick Pick 呈现（[5.2](#52-compare-foldersmoshfeu--activity-bar-视图容器--树视图--内置-diff)）。
5. **"主题 token 三重编码 + 无障碍快捷链"的状态渲染**：每条差异状态同时用（a）`--vscode-gitDecoration.*`/`charts.*` 颜色、（b）Codicon 图标（`add`/`remove`/`edit`/`symbol-parameter` 等）、（c）文字徽标（`+ Added` / `- Removed` / `≠ Modified` / `⇄ Type`）表达，键盘上过滤输入框→结果列表用 `widgetNavigation.focusNext/Previous` 惯例，Webview 观察 `vscode-using-screen-reader` / `vscode-reduce-motion` 类自适应（[7](#7-无障碍accessibility要求)、[2.4](#24-webview-无障碍钩子)）。

### 9.4 组件选型速查

| 需求 | 选型 | 依据 |
| --- | --- | --- |
| 结果总览/导航 | Tree View（自定义 View Container） | [Views UX](https://code.visualstudio.com/api/ux-guidelines/views)："显示数据用 Tree View" |
| 键级并排看值 | 内置 diff 编辑器（`vscode.diff` + 虚拟文档） | [TreeItem.command 官方建议](https://code.visualstudio.com/api/references/vscode-api#TreeItem) |
| 选择项目/文件 | `showOpenDialog` + Quick Pick（分隔符分组、多选） | [Common Capabilities](https://code.visualstudio.com/api/extension-capabilities/common-capabilities)、[Quick Picks UX](https://code.visualstudio.com/api/ux-guidelines/quick-picks) |
| 键级扁平表格/搜索（二期） | Webview（原生 HTML/CSS + `--vscode-*` 变量；组件库可选 VS Code Elements 或 vscrui） | [Webview 指南](https://code.visualstudio.com/api/extension-guides/webview)、[toolkit 弃用公告](https://github.com/microsoft/vscode-webview-ui-toolkit/issues/561) |
| 进度/完成/错误 | 视图内进度 + 通知（少用全局进度、慎用模态） | [Notifications UX](https://code.visualstudio.com/api/ux-guidelines/notifications)、[Common Capabilities / Progress](https://code.visualstudio.com/api/extension-capabilities/common-capabilities#progress-api) |
| 图标 | Codicons（@vscode/codicons） | [Views UX](https://code.visualstudio.com/api/ux-guidelines/views)："尽量使用既有图标" |

---

## 附：本文引用的全部一手来源

- https://code.visualstudio.com/api/extension-capabilities/common-capabilities
- https://code.visualstudio.com/api/ux-guidelines/overview
- https://code.visualstudio.com/api/ux-guidelines/webviews
- https://code.visualstudio.com/api/ux-guidelines/views
- https://code.visualstudio.com/api/ux-guidelines/quick-picks
- https://code.visualstudio.com/api/ux-guidelines/notifications
- https://code.visualstudio.com/api/ux-guidelines/status-bar
- https://code.visualstudio.com/api/extension-guides/webview
- https://code.visualstudio.com/api/extension-guides/tree-view
- https://code.visualstudio.com/api/references/vscode-api
- https://code.visualstudio.com/api/references/theme-color
- https://code.visualstudio.com/docs/editing/codebasics
- https://code.visualstudio.com/docs/configure/accessibility/accessibility
- https://github.com/microsoft/vscode-extension-samples（tree-view-sample / webview-sample / webview-view-sample / quickinput-sample）
- https://github.com/microsoft/vscode-webview-ui-toolkit 及 [issue #561](https://github.com/microsoft/vscode-webview-ui-toolkit/issues/561)
- https://github.com/ryu1kn/vscode-partial-diff
- https://github.com/moshfeu/vscode-compare-folders 、https://marketplace.visualstudio.com/items?itemName=moshfeu.compare-folders
- https://marketplace.visualstudio.com/items?itemName=L13RARY.l13-diff
- https://marketplace.visualstudio.com/items?itemName=ThrottleWorksStudio.json-diff-studio
- https://github.com/pharzan/json-sort-compare-vscode
- https://vscode-elements.github.io/ 、https://github.com/estruyf/vscrui
