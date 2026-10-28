# Config Diff 扩展 · 设计方案包(Design Handoff Package)

> 交给开发实现的完整设计包。**裁决记录:已选定方案 A「三栏工作台」**(VS Code 原生公民路线),并吸收 B 的搜索/表格、C 的向导式规则添加。原型已按 A 落细。

## 这个包怎么用

| 你是 | 从哪开始 |
| --- | --- |
| 开发 | 先读 `01-principles-invariants.md`(不变量是护栏,先记住再动手)→ 按 `02-component-specs.md` 逐组件实现 → 对照 `assets/` 图纸 → 交付前过 `05-acceptance-checklist.md` |
| 设计(新手) | 改任何东西之前读 `01` 的十条不变量;改动不违反不变量 → 自行决定并记录到本文件末尾的「决策日志」;违反 → 找资深设计确认 |
| 测试 | `03-flows-state-machine.md` 的边界决策表 + `05-acceptance-checklist.md` |
| 所有人 | 打开 `prototype/` 里的两个 HTML 原型,所见的交互与视觉即验收基准 |

## 文件地图

```
design-package/
├── README.md                        ← 本文件:索引 / 裁决 / 决策日志
├── 01-principles-invariants.md      ★ 十条不变量 + 骨架约束 + 偏差处理流程(最重要)
├── 02-component-specs.md            ★ 全组件规格:解剖/尺寸/状态/数据契约/交互
├── 03-flows-state-machine.md        流程时序 / 状态机 / 边界决策表 / 键盘地图 / 性能预算
├── 04-copywriting.md                术语表 + 全量 UI 文案 + 语气规则
├── 05-acceptance-checklist.md       验收清单(逐条可测)
├── tokens/design-tokens.json        机器可读设计令牌(3 主题,含 --vscode-* 绑定)
├── schema/rules.schema.json         规则文件 JSON Schema(校验/补全的数据契约)
├── schema/rules.example.jsonc       规则文件示例
├── assets/                          ★ 设计图纸(SVG,带尺寸标注) + 可用资源(图标/CSS)
│   ├── 01-overview-layout.svg … 20-edge-cases.svg   20 张规格图纸(文档说明用)
│   ├── icons/                       ★ 图标资源(生成器产出,可直接用)
│   │   ├── icons.svg                SVG sprite(24+ 符号,Webview 内 <use> 引用)
│   │   ├── i-*.svg                  29 枚单枚图标(16×16,stroke=currentColor)
│   │   ├── activitybar/config-diff-activitybar.svg  活动栏图标(package.json viewsContainers.icon)
│   │   ├── brand/config-diff-logo.svg               品牌 Logo 128×128(Marketplace/README)
│   │   ├── preview.html             图标画廊 + 组件样式预览(双击即看)
│   │   └── tools/gen-icons.mjs      图标生成器(单一事实源;node gen-icons.mjs 重新生成)
│   └── css/                         ★ Webview 样式(可直接 import)
│       ├── variables.css            令牌绑定层:--cd-* → var(--vscode-*, 回退)(INV-1 唯一例外处)
│       ├── webview-report.css       报告组件:徽标/芯片/表格/按钮/抽屉/过期条/通知
│       └── webview-rules.css        规则卡片/开关/源码 token/悬浮卡(二期)
├── prototype/
    ├── config-diff-extension-uiux-prototype.html   高保真交互原型(验收基准)
    └── config-diff-ui-variants-prototype.html      三变体对比原型(裁决依据)
```

## 图标与样式资源(可直接使用)

### 图标(assets/icons/)

**两个层面,别混用:**

| 场景 | 用什么 | 来源 |
| --- | --- | --- |
| 原生 TreeView / 树行图标 | `ThemeIcon("codicon名", ThemeColor)` —— 由 VS Code 渲染,自动随主题 | 02 文档 C2/C6 的 codicon 映射表 |
| Webview(报告/规则编辑器) | `assets/icons/icons.svg` sprite,`<svg class="cd-ic"><use href="icons.svg#i-mod"/></svg>` | 本包生成,currentColor 随 CSS 继承 |

- 状态 ↔ 图标 ↔ 色值对照:`assets/08-status-badges.svg`;**新增状态必须同时补 sprite 与映射表**(INV-2)。
- 文件类型图标配色(Webview 用):yaml `#e2c08d` · env `#d18616` · json `#b5bfc7` · toml `#c0643f` · xml `#7ba7c9` · 通用 `#9d9d9d`(示意;优先走 token 角色申请流程)。
- **改图标**:只改 `icons/tools/gen-icons.mjs` 里的路径数据,然后 `node gen-icons.mjs` 重新生成全部产物(sprite/单枚/preview)。不要手改生成文件。
- `activitybar/` 图标按 VS Code 规范为**黑色形状 + mask 着色**,接入方式:`contributes.viewsContainers.activitybar.icon` 指向该 SVG。
- `brand/` 用于 Marketplace 页与 README,需 PNG 时用 resvg/Inkscape 从 SVG 导出。

### 样式(assets/css/)

Webview 内按此顺序引入:

```html
<link rel="stylesheet" href="css/variables.css" />
<link rel="stylesheet" href="css/webview-report.css" />
<link rel="stylesheet" href="css/webview-rules.css" /> <!-- 规则编辑器(二期) -->
```

- `variables.css` 是 **INV-1 的唯一例外处**(回退值所在);所有业务样式只允许用 `--cd-*` 变量,禁止新 hex。
- 组件类名前缀 `cd-`:徽标 `.cd-badge.st-*`、芯片 `.cd-chip`、表格行 `.cd-row`、动作 `.cd-ra`、按钮 `.cd-btn(.sec)`、抽屉 `.cd-drawer`、过期条 `.cd-stale`、通知 `.cd-toast`、规则卡片 `.cd-rulecard`、开关 `.cd-switch`、源码 `.cd-src`。
- 预览:`assets/icons/preview.html` 双击即可看图标画廊 + 全部组件样例(Dark 回退值);VS Code 内运行时自动适配真实主题。
- 自绘控件(开关/行动作)必须保留 `:focus-visible` 焦点环与 `prefers-reduced-motion` 降级——已在 CSS 内置,勿删(INV-8)。

## 裁决记录(2026-10-28,用户确认)

| 决策点 | 裁决 | 备注 |
| --- | --- | --- |
| 结果页布局 | **方案 A 三栏工作台**(侧边树 + 编辑器详情) | 放弃 B 整页仪表盘、C 纯向导 |
| 树的默认分组 | **按文件**,工具栏 ◫ 一键切按状态 | 两种模式计数同源 |
| 规则入口 | A:侧栏规则视图(常驻);B 式抽屉/C 式向导作为**添加规则按钮的落点** | 全局一份规则状态 |
| 规则查看形态 | 卡片化人话句子(当…且…→ 结论),源码视图进阶可达 | Schema 是契约不是界面 |
| 入口优先级 | 活动栏视图(推荐)> 右键两步 > 命令面板(仅进阶,UI 不引导) | 小白优先 |
| 键级详情 | 内置 `vscode.diff` + 虚拟文档 | 不自建对比 UI |
| Webview 报告 | 二期(P1),树为先 | 报告带文件列、全部文件芯片 |

## 决策日志(开发期由设计/开发共同追加)

> 格式:`日期 | 谁 | 情况 | 决定 | 违反了哪条不变量(或"无")`。凡上线的 UI 改动必须在此留痕。

| 日期 | 谁 | 情况 | 决定 | 不变量 |
| --- | --- | --- | --- | --- |
| 2026-10-28 | 设计 | 原型中侧栏「差异/规则」用标签页 | 落地为 VS Code 原生**同容器双视图堆叠**(差异在上、规则在下),交互语义不变 | #5(更原生,强化) |
