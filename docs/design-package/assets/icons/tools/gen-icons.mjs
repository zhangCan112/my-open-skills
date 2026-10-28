#!/usr/bin/env node
/**
 * Config Diff · 图标生成器(单一事实源)
 * 运行:node gen-icons.mjs
 * 产出:icons.svg(sprite) / 单枚 16×16 SVG / activitybar / brand / preview.html
 * 约定:16×16 viewBox;stroke=currentColor;stroke-width 1.2;圆角端点。改图标只改本文件。
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url))); // assets/icons/
const out = root;
for (const d of ["", "activitybar", "brand"]) mkdirSync(join(out, d), { recursive: true });

/* ── 图标路径定义(16×16,stroke 风格)────────────────────────── */
const G_OPEN = '<g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">';
const G_CLOSE = "</g>";
const DOC = '<path d="M4 1.5h5.2L12 4.3v10.2H4z"/><path d="M9.2 1.5v2.8H12"/>';
const txtMark = (t) => `<text x="8" y="12.8" text-anchor="middle" font-size="6.5" font-weight="700" fill="currentColor" stroke="none" font-family="Consolas, Menlo, monospace">${t}</text>`;

const ICONS = {
  /* ── 状态六件套(INV-2 三重编码的"图标"维)── */
  "i-mod":   '<path d="M3 5.5h10"/><path d="M3 10.5h10"/><path d="M5.2 13.2 10.8 2.8"/>',
  "i-type":  '<path d="M2.5 5.5H12"/><path d="M9.8 3.2 12.3 5.5 9.8 7.8"/><path d="M13.5 10.5H4"/><path d="M6.2 8.2 3.7 10.5 6.2 12.8"/>',
  "i-onlya": '<path d="M3 8h10"/>',
  "i-onlyb": '<path d="M3 8h10"/><path d="M8 3v10"/>',
  "i-equ":   '<path d="M2 9.2l2.2 2.2L8.4 5.6"/><path d="M7.2 9.2l2.2 2.2L14 5.2"/>',
  "i-ign":   '<path d="M2 9.5h12"/><path d="M4.5 11.5l-1.2 2"/><path d="M8 12v2.2"/><path d="M11.5 11.5l1.2 2"/>',
  "i-err":   '<circle cx="8" cy="8" r="5.5"/><path d="M5.9 5.9l4.2 4.2M10.1 5.9 5.9 10.1"/>',
  /* ── 动作 ── */
  "i-compare":     '<rect x="2.5" y="2.5" width="4.6" height="11" rx="0.8"/><rect x="8.9" y="2.5" width="4.6" height="11" rx="0.8"/><path d="M3.6 8h2.4"/><path d="M9.8 8h2.8M11.2 6.6v2.8"/>',
  "i-locate":      '<circle cx="8" cy="8" r="4.4"/><path d="M8 1.5v2.4M8 12.1v2.4M1.5 8h2.4M12.1 8h2.4"/><circle cx="8" cy="8" r="1" fill="currentColor" stroke="none"/>',
  "i-ignore":      '<circle cx="8" cy="8" r="5.5"/><path d="M4.6 4.6l6.8 6.8"/>',
  "i-equiv":       '<path d="M8 13.5V7.5"/><path d="M8 7.5C8 5 6.3 3.8 3.8 3.8"/><path d="M8 7.5c0-2.5 1.7-3.7 4.2-3.7"/><path d="M3.2 2.2v3.2h3.2"/><path d="M12.8 2.2v3.2H9.6"/>',
  "i-refresh":     '<path d="M13.4 8A5.4 5.4 0 1 1 11.6 4"/><path d="M12.3 1.6v2.6H9.7"/>',
  "i-swap":        '<path d="M2.5 5h11"/><path d="M10.7 2.2 13.5 5l-2.7 2.8"/><path d="M13.5 11h-11"/><path d="M5.3 8.2 2.5 11l2.8 2.8"/>',
  "i-group":       '<path d="M2 3.5h4.5M2 8h4.5M2 12.5h4.5M9 3.5h5M9 8h5M9 12.5h5"/>',
  "i-history":     '<path d="M13.4 8A5.4 5.4 0 1 1 8 2.6c2 0 3.7 1 4.7 2.6"/><path d="M12.7 1.9v3.4H9.3"/><path d="M8 5.2V8l2.2 1.4"/>',
  "i-gear":        '<circle cx="8" cy="8" r="2.4"/><path d="M8 1.8v2M8 12.2v2M1.8 8h2M12.2 8h2M3.6 3.6l1.4 1.4M11 11l1.4 1.4M12.4 3.6 11 5M5 11l-1.4 1.4"/>',
  "i-add-rule":    '<circle cx="8" cy="8" r="5.5"/><path d="M8 5.2v5.6M5.2 8h5.6"/>',
  "i-edit-source": '<path d="M5.5 3.5 2 8l3.5 4.5"/><path d="M10.5 3.5 14 8l-3.5 4.5"/>',
  "i-search":      '<circle cx="7" cy="7" r="4.4"/><path d="M10.3 10.3 14 14"/>',
  "i-folder":      '<path d="M1.5 12.5v-8.5h4.2l1.5 1.8h7.3v6.7z"/>',
  "i-open":        '<path d="M7 3.5H3.5v9h9V9"/><path d="M9.5 2.5h4v4"/><path d="M13.2 2.8 8 8"/>',
  "i-chevron-d":   '<path d="M4 6l4 4 4-4"/>',
  "i-chevron-r":   '<path d="M6 4l4 4-4 4"/>',
  /* ── 文件类型 ── */
  "i-file":      DOC,
  "i-file-yaml": DOC + txtMark("Y"),
  "i-file-env":  DOC + txtMark("#"),
  "i-file-json": DOC + txtMark("{}"),
  "i-file-toml": DOC + txtMark("T"),
  "i-file-pair": '<path d="M2.5 12V3h4.6L9 4.8v1.2"/><path d="M6.5 5.5h4.7l2.3 1.9v6.1H6.5z"/><path d="M11.2 5.5v1.9h2.3"/>',
};
const FILE_ICONS = new Set(["i-file", "i-file-yaml", "i-file-env", "i-file-json", "i-file-toml", "i-file-pair"]);

const sym = (id, body) => `<symbol id="${id}" viewBox="0 0 16 16">${G_OPEN}${body}${G_CLOSE}</symbol>`;
const standalone = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${G_OPEN}${body}${G_CLOSE}</svg>`;

/* ── 1. sprite ── */
const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">` +
  Object.entries(ICONS).map(([id, body]) => sym(id, body)).join("") + `</svg>`;
writeFileSync(join(out, "icons.svg"), sprite + "\n");

/* ── 2. 单枚图标 ── */
let n = 0;
for (const [id, body] of Object.entries(ICONS)) {
  writeFileSync(join(out, `${id}.svg`), standalone(body) + "\n"); n++;
}

/* ── 3. 活动栏图标(VS Code 以 mask 方式着色:统一用黑色形状)── */
const activitybar = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <g fill="none" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2.5" y="2.5" width="8" height="8" rx="1.5"/>
    <rect x="13.5" y="13.5" width="8" height="8" rx="1.5"/>
    <path d="M11.5 6.5h4.5m0 0-2-2m2 2-2 2"/>
    <path d="M12.5 17.5H8m0 0 2-2m-2 2 2 2"/>
  </g>
</svg>`;
writeFileSync(join(out, "activitybar", "config-diff-activitybar.svg"), activitybar + "\n");

/* ── 4. 品牌 Logo(Marketplace / README 用,彩色)── */
const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <rect width="128" height="128" rx="24" fill="#1e1e1e"/>
  <rect x="18" y="18" width="40" height="40" rx="8" fill="#3794ff"/>
  <rect x="70" y="70" width="40" height="40" rx="8" fill="#b180d7"/>
  <g fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M62 38h16m0 0-8-8m8 8-8 8"/>
    <path d="M66 90H50m0 0 8-8m-8 8 8 8"/>
  </g>
  <text x="24" y="112" fill="#9d9d9d" font-size="14" font-family="Segoe UI, sans-serif" font-weight="600">CONFIG DIFF</text>
</svg>`;
writeFileSync(join(out, "brand", "config-diff-logo.svg"), logo + "\n");

/* ── 5. 预览页(图标画廊 + 组件样例;双击即可看)── */
const inlineSprite = sprite.replace('style="display:none"', 'style="display:none" aria-hidden="true"');
const ic = (id) => `<svg class="cd-ic"><use href="#${id}"/></svg>`;
const badge = (cls, icon, label) => `<span class="cd-badge ${cls}">${ic(icon)}${label}</span>`;

const preview = `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>Config Diff · 图标与样式预览</title>
<link rel="stylesheet" href="../css/variables.css">
<link rel="stylesheet" href="../css/webview-report.css">
<link rel="stylesheet" href="../css/webview-rules.css">
<style>.gal{display:flex;flex-wrap:wrap;gap:10px}.gal .cell{width:86px;text-align:center;font-size:11px;color:var(--cd-fg-dim)}.gal .cell .cd-ic{width:22px;height:22px;margin-bottom:4px}h2{font-size:13px;color:var(--cd-fg-strong);margin:22px 0 8px;border-bottom:1px solid var(--cd-border);padding-bottom:6px}</style>
</head><body class="vscode-dark">
${inlineSprite}
<h1>Config Diff · 图标与样式预览</h1>
<p class="dim">样式来源:../css/variables.css + webview-report.css + webview-rules.css(在 VS Code Webview 中自动适配主题;此页为 Dark 回退值)。</p>

<h2>状态徽标(六态三重编码)</h2>
<div class="row">${badge("st-mod","i-mod","≠ 值不同")}${badge("st-type","i-type","⇄ 类型不同")}${badge("st-onlya","i-onlya","− 仅在 A")}${badge("st-onlyb","i-onlyb","+ 仅在 B")}${badge("st-equ","i-equ","≈ 规则等价")}${badge("st-ign","i-ign","⊘ 已忽略")}${badge("st-err","i-err","⚠ 解析失败")}</div>

<h2>图标画廊</h2>
<div class="gal">
${Object.keys(ICONS).map(id => `<div class="cell">${ic(id)}<div>${id}</div></div>`).join("")}
</div>

<h2>工具条芯片 + 搜索</h2>
<div class="cd-toolbar">
  <span class="cd-chip active">全部 <span class="cd-n">14</span></span>
  <span class="cd-chip">≠ 值不同 <span class="cd-n">6</span></span>
  <span class="cd-chip">⇄ 类型 2</span>
  <span class="cd-chip">− 仅A 3</span>
  <span class="cd-chip">+ 仅B 3</span>
  <span class="cd-chip">⚙ 规则 <span class="cd-n">4/6</span></span>
  <span class="cd-search"><svg class="cd-ic"><use href="#i-search"/></svg>搜索键路径或值…</span>
</div>

<h2>表格行样例</h2>
<div class="cd-table">
  <div class="cd-head"><span>状态</span><span>键路径</span><span>文件</span><span>A · order-service</span><span>B · template</span><span>操作</span></div>
  <div class="cd-row"><span class="cd-badge st-mod">${ic("i-mod")}值不同</span><span class="k mono"><i>server.</i>port</span><span class="f">application.yaml</span><span class="v mono">8080</span><span class="v mono">8081</span><span class="acts">${ic("i-equiv")}${ic("i-compare")}${ic("i-locate")}${ic("i-ignore")}</span></div>
  <div class="cd-row"><span class="cd-badge st-type">${ic("i-type")}类型不同</span><span class="k mono"><i>database.pool.</i>maxSize</span><span class="f">application.yaml</span><span class="v mono">20</span><span class="v mono">"20"</span><span class="acts">${ic("i-compare")}${ic("i-locate")}${ic("i-ignore")}</span></div>
  <div class="cd-row"><span class="cd-badge st-equ">${ic("i-equ")}规则等价</span><span class="k mono">cache.redis.host</span><span class="f">application.yaml</span><span class="v mono dim">redis-dev.local</span><span class="v mono dim">redis-prod.internal</span><span class="acts">${ic("i-compare")}${ic("i-locate")}</span></div>
  <div class="cd-row"><span class="cd-badge st-ign">${ic("i-ign")}已忽略</span><span class="k mono dim">logging.file.path</span><span class="f">application.yaml</span><span class="v mono dim">./logs/dev</span><span class="v mono absent">— 不存在 —</span><span class="acts"></span></div>
</div>

<h2>规则卡片(人话句 + 开关)</h2>
<div class="cd-rulecard">
  <div class="cd-rule-head"><span class="cd-badge st-equ">${ic("i-equ")}值等价</span><span class="cd-switch on" role="switch" aria-checked="true" tabindex="0"></span></div>
  <div class="cd-sentence">当 键 <span class="cd-cond">cache.redis.host</span> 且 A 值 <span class="cd-cond">redis-dev.local</span> 且 B 值 <span class="cd-cond">redis-prod.internal</span> <span class="cd-then t-equ">→ 视为等价</span></div>
</div>
<div class="cd-rulecard cd-invalid">
  <div class="cd-rule-head"><span class="cd-badge st-equ">${ic("i-equ")}值等价</span><span class="cd-switch" role="switch" aria-checked="false" tabindex="0"></span></div>
  <div class="cd-sentence dim">当 类型宽化 且 值组 <span class="cd-then" style="text-decoration:line-through">→ 视为等价</span></div>
  <div class="cd-invalid-msg">⚠ Schema 校验失败:"values" 与 "coerce" 不能同时设置</div>
</div>

<h2>按钮 / 过期黄条 / 通知</h2>
<div class="row" style="align-items:center">
  <button class="cd-btn">+ 添加规则</button>
  <button class="cd-btn sec">⊘ 忽略此键</button>
  <button class="cd-btn sec">${ic("i-swap")} 对调两侧</button>
</div>
<div class="cd-stale">结果已过期 · 文件在比较后有改动 <button class="cd-btn" style="margin-left:8px">刷新</button></div>
<div class="cd-toast"><span class="ok">✓</span><div>已添加值等价规则<div class="t-sub">键 server.port · A 值 ≈ B 值</div></div></div>

</body></html>`;
writeFileSync(join(out, "preview.html"), preview);

console.log(`generated: icons.svg + ${n} 个单枚图标 + activitybar + brand logo + preview.html`);
