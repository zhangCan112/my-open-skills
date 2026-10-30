# OpenCode 1.x → 2.x 完整迁移指南

本指南整合自 OpenCode V2 官方文档（迁移指南、插件迁移指南、配置参考、CLI 设置、权限、API、客户端等），所有迁移所需信息均在本文内，无需查阅外部资料。

---

## 目录

1. [迁移须知：什么会变、什么不变](#1-迁移须知什么会变什么不变)
2. [快速迁移路线图](#2-快速迁移路线图)
3. [安装与升级](#3-安装与升级)
4. [新架构：客户端-服务器与后台服务](#4-新架构客户端-服务器与后台服务)
5. [配置文件迁移（V1 → V2 字段对照）](#5-配置文件迁移v1--v2-字段对照)
6. [.opencode/ 文件级定义迁移](#6-opencode-文件级定义迁移)
7. [终端客户端配置迁移（tui.json → cli.json）](#7-终端客户端配置迁移tuijson--clijson)
8. [插件迁移（必须重写代码）](#8-插件迁移必须重写代码)
9. [Server API 与客户端集成迁移](#9-server-api-与客户端集成迁移)
10. [行为变化清单（默认值差异）](#10-行为变化清单默认值差异)
11. [迁移后验证清单](#11-迁移后验证清单)
12. [故障排查](#12-故障排查)
13. [附录：字段速查表](#13-附录字段速查表)

---

## 1. 迁移须知：什么会变、什么不变

### 1.1 三个有意的破坏性变更

V2 **只有**以下三处是有意的破坏性变更，其他受支持的 V1 功能都应继续工作：

| 破坏性变更 | 说明 |
| --- | --- |
| **插件 API** | V1 插件实现**无法**在 V2 运行，必须重写代码（见第 8 节） |
| **Server API 与客户端** | 服务端 API 契约重新设计，调用 V1 server API 的集成必须迁移（见第 9 节） |
| **终端客户端配置** | 分层的 `tui.json(c)` 改为单一全局 `cli.json`（**自动迁移**，见第 7 节） |

### 1.2 保持兼容的部分

- 现有受支持的服务器配置字段、agent 定义、command 定义、skills、`.opencode/` 下的其他文件**无需修改即可继续工作**。
- V2 从与 V1 **相同的位置**读取系统、全局、项目配置，并在内存中归一化 V1/V2 字段，**不重写源文件**。
- 如果指南中声明受支持的 V1 行为在 V2 中失效，应视为**兼容性 Bug**（提 issue），而不是预期的迁移要求。

### 1.3 重要前提：V1 与 V2 不再并存

- 两者使用同一个 `opencode` 命令，默认**不能**并存安装。
- 包管理器安装的 V1 需**先卸载**再装 V2；V2 的 curl 安装脚本会直接替换 V1 二进制。
- 迁移验证期间请**保留 V1 环境的备份**。两者使用相同的配置位置，所以**不要**把 V1 指向已转换为 V2 原生格式的配置文件。

---

## 2. 快速迁移路线图

推荐的实用迁移路径（不必一次性完成所有转换）：

```
第 1 步  保留现有配置和文件级定义不动
第 2 步  安装 V2 并启动，验证：模型、凭据、agents、权限、MCP 服务器
第 3 步  移植插件（V1 插件实现在 V2 中不运行，必须重写）
第 4 步  移植调用 server API 的集成代码
第 5 步  （可选）把配置转换为 V2 原生格式 —— 这一步是可选的
```

> V1 配置格式持续受支持。转换为 V2 原生格式只是让配置更显式、更符合人体工程学，不是必须的。

**让 OpenCode 自动帮你迁移配置（推荐做法）**——启动 V2 后直接输入这段提示词：

```text
Migrate my OpenCode configuration, including file-based definitions, from the V1 format to the native V2 format.
Preserve its behavior and all unrelated settings.
```

OpenCode 会检查完整文件、只应用相关变更、不重写无需改动的设置。

### 混合格式规则

- **顶层**可以混用 V1 与 V2 字段，两者可共存；当两种形式设置同一个规范值时，**有效的 V2 原生值优先**（与 JSON 键顺序无关）。
- 嵌套混用是有边界的：OpenCode 识别 `mcp`、`compaction`、`experimental` 内部的 V1/V2 混合成员，但**不会**在单个 agent、provider、command 或 model 内部递归推断格式。**这些嵌套条目必须整体保持一种格式。**
- 受支持的 V1 语法静默工作；格式错误的值、不支持的旧字段、V1/V2 冲突值会产生**警告**，但不影响其他有效设置加载。

---

## 3. 安装与升级

### 3.1 卸载 V1（按需）

包管理器安装的 V1 先卸载（例如 `npm uninstall -g opencode-ai`，其余包管理器同理）。curl 安装的 V1 无需手动卸载，V2 安装脚本会替换二进制。

### 3.2 安装 V2

| 方式 | 命令 |
| --- | --- |
| curl | `curl -fsSL https://opencode.ai/v2/install \| bash` |
| Homebrew | `brew install anomalyco/tap/opencode-v2` |
| npm | `npm install -g @opencode/cli` |
| bun | `bun install -g --trust @opencode/cli` |
| pnpm | `pnpm add -g --allow-build=@opencode/cli @opencode/cli` |
| yarn | `yarn global add @opencode/cli` |
| vite+ | `vp install -g @opencode/cli` |
| AUR | `paru -S opencode-beta` |
| mise | `mise use -g opencode`（需 mise 2026.10.9 及以上，旧版会装成 OpenCode 1） |

注意事项：

- npm 包通过 postinstall 脚本选择平台原生二进制；bun 和 pnpm 的命令中已显式允许该脚本。
- **Windows 包管理器不支持**。Windows 请用 curl 安装脚本，或从官方发布页下载独立二进制（提供 Windows ARM64 / x64 / x64-baseline、macOS Apple Silicon / Intel、Linux glibc / musl 各平台版本）。
- 验证安装：`opencode --version`。

### 3.3 常用启动命令

```bash
opencode                          # 在当前项目打开全屏终端界面
opencode ~/code/my-project        # 指定目录
opencode run "解释这个仓库"        # 非交互提交 prompt（脚本/CI 用）
opencode mini                     # 极简交互界面
```

### 3.4 卸载 V2（如需回退）

```bash
opencode uninstall --dry-run   # 预览将删除的内容
opencode uninstall             # 确认删除（-f 跳过确认，用于非交互）
```

卸载会停止已注册的后台服务和常驻终端，然后删除全局缓存目录。**会话数据、配置和状态永不会被删除。**

---

## 4. 新架构：客户端-服务器与后台服务

V2 是**客户端-服务器架构**：TUI 等界面连接到一个后台服务（background service），由它持有会话、配置、插件、权限和工具执行。

### 4.1 服务管理命令

```bash
opencode service status     # 查看当前服务信息
opencode service restart    # 服务卡住/不健康时重启
opencode service stop       # 显式停止
opencode service start      # 显式启动
opencode api get /api/info  # 验证 API 健康
```

> 服务通常自动发现或启动，服务命令只在诊断生命周期时需要。配置修改**无需重启**服务：OpenCode 监视配置文件，保存后自动重载 agents、commands、skills、MCP 服务器和插件；需要强制完整重载时使用 `/reload`。

### 4.2 独立/指定服务器

```bash
opencode --standalone                    # 使用私有服务器（不连共享服务）
opencode --server http://localhost:4096  # 连接指定服务器
opencode service set disabled true       # 默认禁用共享服务（之后 CLI 命令用私有服务器）
opencode service unset disabled          # 恢复自动使用共享服务
```

排查共享服务问题时，`--standalone` 可用来隔离问题。

### 4.3 关键路径

| 内容 | 路径 |
| --- | --- |
| 日志 | `~/.local/share/opencode/log/opencode.log` |
| 服务注册文件 | `~/.local/state/opencode/service.json` |
| 服务私有配置 | `~/.config/opencode/service.json` |
| 数据库 | `~/.local/share/opencode/opencode.db`（`OPENCODE_DB` 可覆盖） |
| 查询各种路径 | `opencode debug paths [db\|home\|data\|config\|cache\|state\|tmp\|bin\|log\|repos]` |

> ⚠️ 排查问题时**不要删除或编辑**数据库、服务注册文件或服务配置。

---

## 5. 配置文件迁移（V1 → V2 字段对照）

### 5.1 配置文件位置（与 V1 相同，无需改动）

```text
系统级（三选一，按平台）：
  macOS:   /Library/Application Support/opencode/opencode.json(c)
  Linux:   /etc/opencode/opencode.json(c)
  Windows: %ProgramData%\opencode\opencode.json(c)

macOS MDM 托管偏好（最高优先级）：
  /Library/Managed Preferences/<user>/ai.opencode.managed.plist
  /Library/Managed Preferences/ai.opencode.managed.plist

全局（用户级，所有项目生效）：
  ~/.config/opencode/opencode.json(c)

项目级（两种位置均可，支持 monorepo 嵌套包）：
  <project>/opencode.json(c)
  <project>/.opencode/opencode.json(c)
```

**合并与优先级规则**：

- OpenCode 从当前目录向上搜索到文件系统根。先把**直接** `opencode.json(c)` 从最远祖先目录到当前目录合并，然后按同样顺序合并 `.opencode/opencode.json(c)`。**这意味着每个被发现的 `.opencode` 配置都覆盖所有被发现的直接配置。**建议整个目录树统一用一种形式。
- 优先级从低到高：全局 < 仓库级 < 包级（monorepo）；**系统配置和托管偏好覆盖以上全部**。
- 系统目录除 `opencode.json(c)` 外还会为机器上每个用户加载 `agents/`、`commands/`、`skills/`、`plugins/`。
- 托管设置具有最高优先级，用户和项目无法覆盖。要强制限制（如禁用某 provider），必须在托管配置中用 `policies`，普通 settings 无法阻止用户添加 providers、MCP 服务器、agents 或 plugins。

**建议在所有配置文件中保留 `$schema`**（编辑器可获得校验与自动补全）：

```json
{
  "$schema": "https://opencode.ai/config.json"
}
```

**变量替换**（V1/V2 通用）：

```jsonc
{
  "model": "{env:OPENCODE_MODEL}",                          // 环境变量，未设置时为空字符串
  "providers": {
    "openai": { "settings": { "apiKey": "{file:~/.secrets/openai-key}" } }  // 文件内容
  }
}
```

`{file:...}` 路径可相对配置文件目录、绝对路径或 `~/` 开头；文件不存在时替换为空字符串。

### 5.2 permissions —— 变化最大的字段

V1 按工具分组；V2 使用**一个有序数组**，每条规则 `{ action, resource, effect }`，**最后匹配的规则生效**，例外规则放在宽泛规则之后：

```jsonc
// V1
{
  "permission": {
    "bash": { "git push *": "ask" },
    "edit": "allow"
  },
  "tools": { "websearch": false }
}

// V2
{
  "permissions": [
    { "action": "shell", "resource": "git push *", "effect": "ask" },
    { "action": "edit", "resource": "*", "effect": "allow" },
    { "action": "websearch", "resource": "*", "effect": "deny" }
  ]
}
```

**action 改名对照**：

| V1 action | V2 action |
| --- | --- |
| `bash` | `shell` |
| `task` | `subagent` |
| `write`、`patch` | `edit` |

**规则字段**：

| 字段 | 含义 |
| --- | --- |
| `action` | 工具权限动作 |
| `resource` | 被使用的值：路径、命令、URL、查询、skill ID、agent ID 等 |
| `effect` | `allow`（直接放行）/ `deny`（阻止）/ `ask`（等待用户决定） |

没有规则匹配时默认 `ask`。

**通配符匹配**：

| 模式 | 匹配 |
| --- | --- |
| `*` | 零个或多个字符（含 `/`） |
| `?` | 恰好一个字符 |
| 其他 | 字面字符 |

- 路径匹配整个规范化路径；反斜杠规范化为斜杠；Windows 上匹配不区分大小写。
- 以 `" *"` 结尾的 shell 模式同时匹配不带参数的命令：`"git status *"` 同时匹配 `git status` 和 `git status --short`。
- 规则按顺序合并：低优先级配置先加载，全局规则其次，agent 规则最后追加。
- 一个操作可能检查多个资源（如补丁涉及多个文件）：任一 `deny` 即拒绝；否则任一 `ask` 即询问；否则放行。

**V2 内置 action 清单**（action 名是字符串，插件可定义更多）：

| Action | Resource |
| --- | --- |
| `read` | 位置相对内部路径或规范化的外部绝对路径 |
| `edit` | `edit`、`write`、`patch` 的目标路径 |
| `glob` | 请求的 glob 模式 |
| `grep` | 请求的正则表达式（不是搜索路径） |
| `shell` | 扫描器生成的命令串；复合命令可能产生多条 |
| `subagent` | 目标 agent ID |
| `skill` | Skill ID |
| `question` | `*` |
| `webfetch` | 请求的 URL |
| `websearch` | 搜索查询 |
| `experimental_image_generate` | 图像模型 `providerID/modelID`（可含 `#variant`） |
| `external_directory` | 规范化的外部目录边界，通常以 `/*` 结尾 |
| `<server>_<tool>` | MCP 工具为 `*`；名称中不支持的字符变为 `_` |
| `opencode_list_mcp_resources` | MCP 服务器名 |
| `opencode_read_mcp_resource` | `<server>:<uri>` |
| `execute` | `*`；deny 会移除 Code Mode 及仅经它到达的工具 |

**默认策略**：每个 agent（含自定义 agent）的基础策略是全部 `allow`，但读取 `*.env`、`*.env.*` 时 `ask`（`*.env.example` 放行）。

> ⚠️ **重要行为差异**：V1 访问项目外路径会先询问；**V2 默认允许** `external_directory`。要保持 V1 行为，加一条规则：
>
> ```jsonc
> { "permissions": [ { "action": "external_directory", "resource": "*", "effect": "ask" } ] }
> ```
>
> 之后的更窄规则可对特定目录单独 allow/deny。`~`、`~/`、`$HOME`、`$HOME/` 开头的路径会在加载时展开（仅限 `external_directory`、`read`、`edit`；shell 资源不展开）。

**agent 级权限**：共享规则放顶层，更窄的规则放 `agents.<id>.permissions`（追加在全局规则之后，不是替换）。自定义 subagent 使用**自己的**权限，不是父 agent 权限的子集。

**ask 时的审批选项**：`once`（仅本次）、`always`（保存工具建议的模式为项目级持久 allow 规则，永不覆盖已配置的 deny）、`reject`（拒绝并拒绝该会话所有待定请求）。

**todos 工具默认关闭**（V1 另说）。要开启：

```jsonc
{ "experimental": { "todo": true } }   // 实验性，未来版本可能变更或移除
```

### 5.3 agents

单数 `agent`（及已弃用的 `mode`）映射改为复数 `agents`：

```jsonc
// V1
{
  "agent": {
    "reviewer": {
      "prompt": "Review for correctness and missing tests.",
      "model": "anthropic/claude-sonnet-5-5",
      "variant": "high",
      "disable": false,
      "permission": { "edit": "deny" }
    }
  }
}

// V2
{
  "agents": {
    "reviewer": {
      "system": "Review for correctness and missing tests.",
      "model": "anthropic/claude-sonnet-5-5#high",
      "disabled": false,
      "permissions": [ { "action": "edit", "resource": "*", "effect": "deny" } ]
    }
  }
}
```

字段变化：

| V1 | V2 | 说明 |
| --- | --- | --- |
| `prompt` | `system` | 系统提示词 |
| `disable` | `disabled` | 布尔取反语义不变 |
| `model` + `variant` | `model: "provider/model#variant"` | variant 用 `#` 拼接 |
| `maxSteps` | `steps` | |
| `permission` | `permissions` | 数组形式，见 5.2 |

- 旧 `mode` 映射中的条目成为 **primary agents**（主 agent）。
- **`request.body` 保留但不再发送给模型**：V1 在 agent 上设置的 `temperature`、`top_p`、`options` 无效。请改设在 **model variant** 上（见 5.9）。

V2 agent 还支持 `description`（描述）和 `mode`（`"subagent"` 或 `"primary"`）字段。

### 5.4 snapshots 与 media

```jsonc
// V1 → V2
{ "snapshot": false }
{ "snapshots": false }          // 布尔值不变，仅改名

{ "attachment": { "image": { "auto_resize": true } } }
{ "media": { "image": { "auto_resize": true } } }   // 嵌套 image 设置名不变
```

`media` 完整字段：`image.auto_resize`、`max_width`、`max_height`、`max_base64_bytes`。

### 5.5 mcp

V2 把服务器收进 `mcp.servers`，`enabled` 改为反向的 `disabled`，`timeout` 数字拆分为两种用途：

```jsonc
// V1
{
  "mcp": {
    "playwright": {
      "type": "local",
      "command": ["npx", "@playwright/mcp"],
      "enabled": true,
      "timeout": 30000
    }
  }
}

// V2
{
  "mcp": {
    "servers": {
      "playwright": {
        "type": "local",
        "command": ["npx", "@playwright/mcp"],
        "disabled": false,
        "timeout": { "catalog": 30000, "execution": 30000 }
      }
    }
  }
}
```

- 远程 OAuth 字段改 snake case：`clientId`→`client_id`、`clientSecret`→`client_secret`、`callbackPort`→`callback_port`、`redirectUri`→`redirect_uri`。
- V1 `experimental.mcp_timeout` 的值成为 `mcp.timeout.catalog` 和 `mcp.timeout.execution` 的默认值。
- 全局 `mcp.timeout` 适用于配置文件中定义的服务器；每个服务器的 `timeout` 覆盖全局值。
- 优先用 CLI 管理 MCP（保留无关配置）：`opencode mcp add <name> --global --url <远程URL>`、`opencode mcp list`。远程服务器默认 OAuth；如需登录，在界面中运行 `/mcps` 选择服务器登录。**支持 OAuth 时不要使用 API key**；必须用 header 凭据时用 `{env:MCP_API_KEY}` 这类环境变量替换，不要明文写密钥。

### 5.6 compaction

```jsonc
// V1
{ "compaction": { "preserve_recent_tokens": 8000, "reserved": 20000 } }

// V2
{ "compaction": { "keep": { "tokens": 8000 }, "buffer": 20000 } }
```

- `auto` 名称不变。
- V2 **没有** `tail_turns` 和 `prune` 字段，这两个旧字段被忽略并警告；近期上下文改用 token 预算保留。
- 本地摘要是默认压缩方式；可通过 provider/model 的 `settings.compaction: { "type": "native" }` 选择原生 provider 压缩（model 设置覆盖 provider 设置）。
- `compaction.auto: false` 禁用新的自动压缩，但不丢弃已安装的 checkpoints。

### 5.7 skills（配置）

V1 分开的路径数组和 URL 数组合并为一个有序数组：

```jsonc
// V1
{ "skills": { "paths": ["./team-skills"], "urls": ["https://example.com/skills/"] } }

// V2
{ "skills": ["./team-skills", "https://example.com/skills/"] }
```

`.opencode/skills/` 下的自动发现不变。

### 5.8 commands（配置）

```jsonc
// V1
{
  "command": {
    "review": {
      "template": "Review the current changes.",
      "model": "anthropic/claude-sonnet-5-5",
      "variant": "high",
      "subtask": true
    }
  }
}

// V2
{
  "commands": {
    "review": {
      "template": "Review the current changes.",
      "model": "anthropic/claude-sonnet-5-5#high",
      "subagent": true
    }
  }
}
```

- `command`→`commands`，`subtask`→`subagent`，`variant` 拼入 model 引用。
- `template`、`description`、`agent` 名称不变。
- 旧 `subtask` 仍被接受。**行为变化**：委托命令现在自动在后台运行并把结果汇报给父会话。

### 5.9 providers 与 models

**providers**：

```jsonc
// V1
{
  "provider": {
    "acme": {
      "npm": "@ai-sdk/openai-compatible",
      "api": "https://llm.example.com/v1",
      "options": { "apiKey": "{env:ACME_API_KEY}" }
    }
  }
}

// V2
{
  "providers": {
    "acme": {
      "package": "aisdk:@ai-sdk/openai-compatible",
      "settings": {
        "baseURL": "https://llm.example.com/v1",
        "apiKey": "{env:ACME_API_KEY}"
      }
    }
  }
}
```

| V1 | V2 | 说明 |
| --- | --- | --- |
| `provider` | `providers` | |
| `npm` | `package` | AI SDK 包加 `aisdk:` 前缀 |
| `api` | `settings.baseURL` | |
| `options` | 按请求角色拆分为 `settings`、`headers`、`body` | |
| `options.setCacheKey` | `compatibility.supportsPromptCacheKey` | |

**内置 provider ID 合并**（迁移时使用规范 ID）：

| V1 provider ID | V2 规范 ID |
| --- | --- |
| `azure-cognitive-services` | `azure` |
| `google-vertex-anthropic` | `google-vertex` |

明确的 V1 provider/agent/command/provider-filter 字段迁移时使用规范 ID；顶层 `model` 字段本身语法在 V2 中合法可保留，但迁移旧内置 provider 时应更新其中的 provider ID。

**models**（仍嵌套在 provider 下）：

| V1 | V2 |
| --- | --- |
| `id` | `modelID` |
| `tool_call`、`modalities` | `capabilities.tools`、`capabilities.input`、`capabilities.output` |
| `status: "deprecated"` | `disabled: true` |
| `cache_read` / `cache_write` | `cache.read` / `cache.write` |
| `options` | `settings` |
| variants 对象 | variants 数组（每项带 `id`） |

```jsonc
// V1
{ "variants": { "high": { "reasoningEffort": "high" } } }

// V2
{ "variants": [ { "id": "high", "settings": { "reasoningEffort": "high" } } ] }
```

agent 的采样参数和 provider 选项应设在 model variant 上。例如 DeepSeek 仅在关闭思考时应用 `temperature`：

```jsonc
{
  "providers": {
    "opencode": {
      "models": {
        "deepseek-v4.1-flash": {
          "variants": [ { "id": "review", "body": { "thinking": { "type": "disabled" }, "temperature": 0.2 } } ]
        }
      }
    }
  },
  "agents": { "reviewer": { "model": "opencode/deepseek-v4.1-flash#review" } }
}
```

规则：`body` 用于 provider JSON 字段，`settings` 用于 provider 包选项。V2 中 provider `settings.transport: "websocket"` 可为其会话选择 WebSocket。

给现有 provider 添加自定义 model 的示例：

```jsonc
{
  "providers": {
    "openai": {
      "models": {
        "gpt-6.1-sol-custom": {
          "modelID": "gpt-6.1-sol",
          "name": "GPT-6.1 Sol Custom",
          "limit": { "context": 200000, "output": 32000 }
        }
      }
    }
  }
}
```

### 5.10 references

```jsonc
// V1
{ "reference": { "docs": "../docs" } }

// V2
{ "references": { "docs": "../docs" } }
```

V1 已接受 `references`，若已在用则无需改动。条目形状不变，支持本地目录和 Git 仓库：

```jsonc
{
  "references": {
    "docs": { "path": "../product-docs", "description": "Product behavior and terminology" },
    "effect": { "repository": "Effect-TS/effect", "branch": "main" }
  }
}
```

### 5.11 无需迁移的字段

形状不变、直接保留的字段：`shell`、`model`、`default_agent`、`watcher`、`formatter`、`instructions`、`enterprise`、`tool_output`。

### 5.12 受支持但无 V2 原生等价物的字段（保持 V1 语法即可，无警告归一化）

| V1 字段 | V2 处理方式 |
| --- | --- |
| `enabled_providers` | 内部转换为"默认拒绝 + 对列出 provider 允许"的 provider policy |
| `disabled_providers` | 内部转换为对列出 provider 的 deny policy |
| `autoupdate` | 改名为 `update`：`false`→`"disable"`，`"notify"`→`"notify"`，`true`→`"auto"`。`update` 只在全局配置生效，项目级值被忽略 |
| `small_model` | 改为内置 `title` agent 的 model 选择，即 `agents.title.model` |

policy 示例（管理员强制限制的正确方式）：

```jsonc
{
  "policies": [
    { "action": "provider.use", "resource": "*", "effect": "deny" },
    { "action": "provider.use", "resource": "anthropic", "effect": "allow" },
    { "action": "tool.use", "resource": "shell:git push *", "effect": "deny" }
  ]
}
```

另：`experimental.policies` 已弃用，改用顶层 `policies`（旧键仍有效并合并进去）。

### 5.13 被接受但不支持的字段（V2 忽略并警告，属有意行为）

| 被忽略的字段 | 替代方案 |
| --- | --- |
| `logLevel` | 启动时用环境变量 `OPENCODE_LOG_LEVEL` |
| `server` | 用 V2 服务与显式服务器选项（server API 是有意的破坏性变更） |
| 顶层 `subagent_depth` | `experimental.subagent_depth` |
| `compaction.tail_turns`、`compaction.prune` | `compaction.keep.tokens` 与基于 checkpoint 的压缩 |
| V1 JSON 配置中 agent 的 `name` | |
| 无 `type` 的仅启用型 V1 MCP 条目 | |
| V1 experimental：`batch_tool`、`openTelemetry`、`primary_tools`、`continue_loop_on_deny` | |
| V1 provider 字段：`id`、`whitelist`、`blacklist` | |
| V1 provider-model 字段：`release_date`、`attachment`、`reasoning`、`temperature`、`experimental`、非 `deprecated` 的 `status`、布尔 `interleaved` | |

### 5.14 LSP：配置保留但功能移除

V2 接受并保留 `lsp` 配置，但**不运行语言服务器、不暴露 LSP 工具、不产生 LSP 诊断**。依赖这些能力的工作流请改用项目的 lint / typecheck / 编译器命令。

---

## 6. .opencode/ 文件级定义迁移

### 6.1 agent 文件

- V1 目录 `agent/`、`agents/`、`mode/`、`modes/` 在 V2 中**全部继续被发现**。
- V2 推荐位置：`.opencode/agents/<name>.md`。
- `mode/`、`modes/` 下的文件代表 primary agents；移入 `agents/` 时在 frontmatter 加 `mode: primary`。
- `agent/` 下的文件移到 `agents/` 时路径派生的 ID 不变。
- Markdown 正文就是 agent 的系统指令，保持不变。
- frontmatter 字段转换：`prompt`→`system`（仅 JSON 配置需要；文件正文不需要 `system` 字段）、`disable`→`disabled`、`permission`→`permissions`、`model` + `variant` 合并为 `provider/model#variant`。
- **V1 frontmatter 仍自动翻译**，但每个文件按单一格式读取：文件中只要出现 `permissions`、`request`、`system`、`disabled` 之一就被当作 V2 读取，其中的 V1 字段（`name`、`tools`、`permission`、`temperature`）被忽略并记录警告。**一次性格式化整个文件的 frontmatter，不要混用。**

### 6.2 command 文件

- V1 的 `command/` 和 `commands/` 都继续被发现；推荐 `.opencode/commands/<name>.md`。
- 从 `command/` 移到 `commands/` 相同相对路径即可保留命令名。
- Markdown 正文仍是命令模板；`description`、`agent` 不变；`subtask` 改为 `subagent`；分开的 `model` + `variant` 合并：

```yaml
# V1
model: anthropic/claude-sonnet-5-5
variant: high
subtask: true

# V2
model: anthropic/claude-sonnet-5-5#high
subagent: true
```

### 6.3 skill 文件

- V2 同时从 `.opencode/skill/` 和 `.opencode/skills/` 发现；推荐布局：`.opencode/skills/<skill-id>/SKILL.md`。
- **移动完整技能目录**（不只 SKILL.md），保证相对脚本、参考文件等仍然可用。
- **保持目录名稳定**以保留 skill ID。现有 frontmatter 和正文无需重写。

### 6.4 指令文件（AGENTS.md / CLAUDE.md）

- 现有 `AGENTS.md` 原地保留。V2 发现全局 `~/.config/opencode/AGENTS.md` 以及从当前目录向上到 home 的各级 `AGENTS.md`；home 之外的项目发现到项目根为止。
- ⚠️ **V2 只发现 `AGENTS.md`**。如果 V1 依赖 `CLAUDE.md` 回退，请把内容并入相应的 `AGENTS.md`（这理论上属于兼容性回归，可附带项目详情提兼容性 issue）。

---

## 7. 终端客户端配置迁移（tui.json → cli.json）

### 7.1 发生了什么

- V1 的分层 `tui.json(c)` 被**单一全局文件**取代：`~/.config/opencode/cli.json`（设置了 `$XDG_CONFIG_HOME` 时为 `$XDG_CONFIG_HOME/opencode/cli.json`）。
- **自动迁移**：`cli.json` 不存在时，V2 终端客户端首次启动会迁移受支持的全局 `tui.json` 设置和已保存的偏好，V1 文件保持原样不动。
- 项目级客户端配置**不被迁移**（V2 客户端配置是全局的，没有项目级 CLI 设置文件）。
- 该文件归终端客户端所有，后台服务不加载它。
- 界面内按 `Ctrl+P` → **Open settings** 可修改常用设置。

### 7.2 基本格式

```json
{
  "$schema": "https://opencode.ai/v2/cli.json"
}
```

- 有效编辑在 TUI 运行期间**热重载**；未知设置被忽略。
- 可用环境变量叠加内联 JSON（嵌套对象合并，数组和标量被替换；变量存在期间内联值始终权威）：

```sh
OPENCODE_CLI_CONFIG_CONTENT='{"tabs":{"mode":"off"}}' opencode
```

### 7.3 主要设置分组速览

```jsonc
{
  "theme": { "name": "tokyonight", "mode": "system" },   // mode: system|dark|light
  "animations": true,
  "cursor": { "style": "block", "blinking": true },       // style: block|underline|line|default

  "mouse": true,
  "scroll": { "speed": 3, "acceleration": false },
  "prompt": { "editor": true, "paste": "compact", "image_preview": false },  // paste: compact|full

  "session": {
    "sidebar": "auto",          // auto|hide
    "scrollbar": false,
    "thinking": "hide",         // show|hide
    "grouping": "auto",         // auto|none
    "image_preview": false,
    "tps": true,                // 页脚显示 tokens/s
    "markdown": "rendered",     // source|rendered
    "new_location": "launch",   // launch|inherit
    "permissions": "prompt"     // prompt|autoaccept
  },

  "tabs": {
    "mode": "auto",             // auto|on|off（旧布尔 tabs.enabled 仍受支持）
    "scope": "cwd",             // cwd|global
    "layout": "horizontal",     // horizontal|vertical
    "indicators": "status"      // status|numbers
  },

  "diffs": {
    "source": "branch",         // branch|committed|working|turn
    "wrap": "word",             // word|none
    "tree": true,
    "single": false,
    "view": "auto"              // auto|split|unified
  },

  "attention": {                // 提醒
    "notifications": true,      // 系统通知（终端未聚焦时）
    "sound": true,
    "volume": 0.4,
    "sound_pack": "opencode.default",
    "sounds": { "permission": "/home/me/sounds/permission.wav" }  // 可覆盖 default|question|permission|error|done|subagent_done
  },

  "terminal": { "title": true, "copy": "select" },   // copy: manual|select（Windows 默认 manual）

  "mini": {                     // opencode mini 的显示选项（show|hide 为主）
    "thinking": "show", "tools": "hide", "shell_output": "hide",
    "turn_summary": "show", "footer": "show", "splash": "show",
    "work_spinner": "block-soft-slide", "mono": false,
    "replay": true, "replay_limit": 200
  },

  "keybinds": { /* 见 7.4 */ },
  "plugins": [                  // 仅终端的插件（有序；- 前缀为禁用指令）
    "-opencode.notifications",
    { "package": "./plugins/status", "options": { "compact": true } }
  ],

  "highlights": false,          // 关闭更新亮点弹窗（/highlights 可再次查看）
  "debug": { "devtools": false, "timing": false, "turn_tokens": "verbose" },
  "experimental": {}
}
```

### 7.4 键位绑定

键位在 `cli.json` 的 `keybinds` 中配置。**不要猜测命令 ID**，用 TUI 的 Experiments/设置界面或下面的高频表为准；未知命令 ID 被忽略。

绑定值三种形式 + 禁用 + leader：

```json
{
  "keybinds": {
    "leader": "ctrl+space",                    // leader 键（默认 ctrl+x）
    "command.palette.show": "ctrl+k",          // 字符串：单键
    "app.exit": "ctrl+c,ctrl+d",               // 逗号分隔备选键（或数组）
    "prompt.paste": {                          // 对象：控制事件行为
      "key": "ctrl+v",
      "event": "press",                        // press|release
      "preventDefault": false,
      "fallthrough": false
    },
    "app.debug": "none",                       // "none" 或 false 禁用
    "help.show": false,
    "model.list": "<leader>m"                  // <leader> 引用 leader 键
  },
  "leader": { "timeout": 2000 }                // leader 后等待毫秒数
}
```

高频默认键位（迁移自查用）：

| 命令 ID | 默认 |
| --- | --- |
| `leader` | `ctrl+x` |
| `app.exit` | `ctrl+c,ctrl+d,<leader>q` |
| `command.palette.show` | `ctrl+p` |
| `app.clear`（仅 mini） | `ctrl+l` |
| `session.new` / `session.list` | `<leader>n` / `<leader>l` |
| `session.tab.next` / `session.tab.previous` | `ctrl+tab` / `ctrl+shift+tab` |
| `session.tab.close` / `session.tab.reopen` | `<leader>w` / `ctrl+shift+t` |
| `session.tab.select.1`~`.10` | `<leader>1`~`<leader>9`、`<leader>0`（兼 `ctrl+数字`） |
| `session.rename` / `session.delete` | `ctrl+r` / `ctrl+d` |
| `session.interrupt` | `escape` |
| `session.compact` | `<leader>c` |
| `session.undo` / `session.redo` | `<leader>u` / `<leader>r` |
| `session.timeline` | `<leader>g` |
| `session.export` | `<leader>x` |
| `session.sidebar.toggle` | `<leader>b` |
| `open.menu`（最近会话/项目） | `ctrl+o` |
| `model.list` / `agent.list` | `<leader>m` / `<leader>a` |
| `agent.cycle` / `variant.cycle` | `shift+tab` / `ctrl+t` |
| `model.cycle_recent`（反向 `shift+f2`） | `f2` |
| `prompt.queue` | `<leader>return` |
| `prompt.editor` | `<leader>e` |
| `messages.copy` | `<leader>y` |
| `opencode.status` | `<leader>s` |
| `terminal.toggle` / `terminal.select` / `terminal.close` | `<leader>t` / `<leader>down` / `<leader>up` |
| `pane.focus.left` / `pane.focus.right` | `<leader>left` / `<leader>right` |
| `input.submit` / `input.newline` | `return` / `shift+return,ctrl+return,alt+return,ctrl+j` |
| `prompt.clear` | `ctrl+c` |
| `which-key.toggle` | `ctrl+alt+k` |

diff 查看器内建按键（非 keybinds 配置项）：`d` 切换范围、`n`/`p` 文件间移动、`m` 标记已审查、`b` 文件树、`s` 单补丁、`v` 视图、`f` 全屏、`?` 帮助。已退役的 `diff.toggle`、`diff.expand` 等配置条目仍被接受但不再注册快捷键。

---

## 8. 插件迁移（必须重写代码）

> ⚠️ **V1 插件实现在 V2 中不运行。移动文件或改配置项名称是不够的，必须移植代码。**
> 插件**配置**可以自动归一化；插件**实现代码**必须手工移植。

### 8.1 配置迁移：plugin → plugins

```jsonc
// V1
{
  "plugin": [
    "opencode-example-plugin",
    ["./plugin/local.ts", { "enabled": true }]
  ]
}

// V2
{
  "plugins": [
    "opencode-example-plugin",
    { "package": "./plugin/local", "options": { "enabled": true } }
  ]
}
```

- 包与选项的元组改为对象形式。
- V2 从 `.opencode/plugin/` 和 `.opencode/plugins/` 两处发现本地插件；V2 文件用 `.opencode/plugins/`。
- **配置中的本地路径必须是目录**：`./plugin/local.ts` 会被跳过并记录警告，需移到 `./plugin/local/index.ts`。移动时把支撑模块一起放在旁边。
- 支持的 `plugins` 条目形式：包名、`包名@版本`、相对/绝对路径目录、`file://` URL、`{ package, options }` 对象。
- 一条配置加载插件的所有部分（server/TUI/GUI）；只有 TUI 部分的插件放 `cli.json` 的 `plugins`。
- 插件管理命令：`opencode plugin list [--builtin]`、`opencode plugin add <包>`、`opencode plugin check`、`opencode plugin update`、`opencode plugin remove <包>`。

### 8.2 入口点重写

核心变化：V1 导出一个返回 `{ tools, hooks }` 的异步函数；V2 **default-export** 一个带 `id` 和 `setup(ctx)` 的定义，一切通过 context 注册：

```ts
// V1
import type { Plugin } from "@opencode-ai/plugin"

export const ExamplePlugin: Plugin = async ({ directory, project, client }) => {
  await client.app.log({
    body: { service: "example", level: "info", message: `Loaded for ${project.id}` },
  })
  return {
    // V1 tools 和 hooks
  }
}
```

```ts
// V2
import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "example",                     // 每个 V2 插件都需要稳定的 id
  async setup(ctx) {
    await ctx.storage.set("last-project", ctx.location.project.id)
    console.log(`Loaded for ${ctx.location.directory}`)
  },
})
```

要点：

- **包名变化**：`@opencode-ai/plugin` → `@opencode/plugin`。
- `id` 用于插件存储作用域、状态与诊断标识，必须稳定。
- `setup` 可返回一个 **cleanup 函数**，插件卸载时执行。
- 已发布的插件应依赖与目标 OpenCode 版本兼容的 `@opencode/plugin` 版本。
- 插件的 package.json 通过 `exports` 暴露各部分（server `.`/`./server`、`./tui`、`./gui-experimental`、`./rpc`），SDK 全部来自 `@opencode/plugin` 一个依赖。

### 8.3 context 迁移对照

V2 的 context **本身就是**一个 OpenCode 客户端 + 插件 API，操作按领域分组，不再挂在单独的 `client` 属性上：

| V1 | V2 |
| --- | --- |
| `directory` | `ctx.location.directory` |
| `project` | `ctx.location.project` |
| `client` | 领域方法，如 `ctx.session`、`ctx.permission`、`ctx.agent` |
| 插件选项参数 | `ctx.options` |
| 返回的 `dispose()` 钩子 | `setup` 返回的 cleanup 函数 |
| 返回的 `event` 钩子 | `ctx.event.subscribe()` |
| 返回 config/model/tool 变更 | 相应领域的 `transform(...)` |
| `$` Bun shell 助手 | 自行导入并管理插件所用的进程 API |

可用领域远不止表中这些，包括：`agent`、`provider`、`model`、`command`、`integration`、`credential`、`mcp`、`plugin`、`reference`、`permission`、`session`、`skill`、`storage`、`tool`、`vcs`、`worktree`、`websearch`、`event` 等。

注意：`ctx.location` 是**本插件实例**加载的位置，不是它观察到的每个会话/事件的位置——需要区分时读取会话或事件数据。

### 8.4 钩子注册方式迁移

V1 按字符串 key 返回钩子；V2 在拥有该操作的**领域**上注册，回调收到**单个可变 event**（不再是分开的 `input`/`output`）：

```ts
// V1
import type { Plugin } from "@opencode-ai/plugin"

export const GuardPlugin: Plugin = async () => ({
  "tool.execute.before": async (input, output) => {
    if (input.tool === "read" && output.args.filePath.includes(".env")) {
      throw new Error("Do not read .env files")
    }
  },
  "shell.env": async (_input, output) => {
    output.env.COMPANY_ENV = "development"
  },
})
```

```ts
// V2
import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "company.guard",
  async setup(ctx) {
    await ctx.tool.hook("execute.before", (event) => {
      const input = event.input as { filePath?: string }
      if (event.tool === "read" && input.filePath?.includes(".env")) {
        throw new Error("Do not read .env files")
      }
    })

    await ctx.shell.hook("create.before", (event) => {
      event.env.COMPANY_ENV = "development"
    })
  },
})
```

注册在插件生命周期内保持活跃、卸载时自动释放；只有需要**提前**移除时才保留返回的 registration 并调用 `registration.dispose()`。

**V1 钩子 → V2 API 完整对照表**：

| V1 钩子 | V2 API |
| --- | --- |
| `event` | `ctx.event.subscribe()` |
| `dispose` | `setup` 返回的 cleanup 函数 |
| `config` | 受影响领域上的 transforms |
| `tool` map | `ctx.tool.transform(...)` |
| `auth` | `ctx.integration.transform(...)` 和 integration API |
| `provider` | `ctx.provider.transform(...)` 和 `ctx.model.transform(...)` |
| `chat.message` | `ctx.session.hook("prompt", ...)` |
| `chat.params` | `ctx.session.hook("context", ...)` |
| `chat.headers` | `ctx.session.hook("model.request", ...)` 或 `"http.request"` |
| `permission.ask` | `ctx.permission.hook("evaluate", ...)` |
| `command.execute.before` | 命令 transform 或 prompt 钩子（取决于意图） |
| `tool.execute.before` | `ctx.tool.hook("execute.before", ...)` |
| `tool.execute.after` | `ctx.tool.hook("execute.after", ...)` |
| `shell.env` | `ctx.shell.hook("create.before", ...)` |
| `tool.definition` | `ctx.tool.transform(...)` |
| `experimental.chat.system.transform` | `ctx.session.hook("context", ...)` 编辑 `event.system` |
| `experimental.chat.messages.transform` | `ctx.session.hook("context", ...)` 编辑 `event.messages` |
| `experimental.session.compacting` | `ctx.session.hook("compaction", ...)` |

**注意**：这些是迁移目的地，不总是精确重命名——

- V2 `prompt` 钩子在持久化 prompt 准入**之前**运行；`context` 在 agent 模型请求**之前**立即运行。要作用于**每一种**模型请求，需分别注册 `context`、`compaction`、`generate`、`title`。
- 使用 `experimental.compaction.autocontinue`、`experimental.provider.small_model`、`experimental.text.complete` 的插件没有直接对应钩子，需对照 V2 的 session/provider/model/event API 重新设计。
- `command.execute.before` 没有一对一的全局钩子：插件自己拥有该命令就用 `ctx.command.transform` 注册；真实意图是修改命令提交的 prompt 就用 prompt 钩子。

**V2 会话钩子完整清单**（`ctx.session.hook(name, callback, options?)`；除 `prompt` 外都支持第三参 `{ providerID: "..." }` 做 provider 作用域）：

`prompt`、`context`、`compaction`、`generate`、`title`、`model.request`、`http.request`、`http.response`、`experimental.ws.handshake`、`experimental.ws.send`、`experimental.ws.receive`、`retry`。

各钩子用途速查：

| 钩子 | 用途 |
| --- | --- |
| `prompt` | prompt 准入前改写文本/附件/元数据/投递方式（steer/queue） |
| `context` | 修改模型可见上下文：`event.system`、`event.messages`、`event.tools`、`event.options` |
| `compaction` | 压缩摘要；设 `event.result` 可自记压缩并跳过模型调用 |
| `generate` / `title` | 一次性生成 / 标题生成（title 无 agent 和 tools） |
| `model.request` | 模型请求头和原始请求设置 |
| `http.request` / `http.response` | 原生 provider HTTP 交换（`event.kind`: primary/compaction/title/generate） |
| `retry` | 覆盖 provider 失败重试决策（`event.decision = { retry, delay }`） |

其他领域的钩子：`ctx.permission.hook("evaluate", ...)`（在配置规则求值后、提示发布前改写 `event.effect`/`event.message`；显式配置的 deny 是最终决定，不经过钩子）、`ctx.shell.hook("create.before", ...)`（改命令/cwd/timeout/env）、`ctx.tool.hook("execute.before"/"execute.after", ...)`。

### 8.5 请求钩子分层

V2 把"prompt 准入 / 模型可见上下文 / 语义模型选项 / 原生 HTTP"分开，**选最窄的层**：

```ts
// V1
import type { Plugin } from "@opencode-ai/plugin"

export const RequestPlugin = async () => ({
  "chat.params": async (_i, output) => {
    output.temperature = 0.2
    output.maxOutputTokens = 8_000
  },
  "chat.headers": async (_i, output) => {
    output.headers["x-plugin"] = "review"
  },
  "experimental.chat.system.transform": async (_i, output) => {
    output.system.push("Focus on correctness.")
  },
})
```

```ts
// V2
import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "review-request",
  async setup(ctx) {
    await ctx.session.hook("context", (event) => {
      event.system.push({ type: "text", text: "Focus on correctness." })
      event.options.temperature = 0.2
      event.options.maxTokens = 8_000
    })

    await ctx.session.hook("model.request", (event) => {
      event.headers["x-plugin"] = "review"
    })
  },
})
```

- 语义化 provider 选项放 `event.options`（如 OpenAI Responses 用 `reasoningEffort`；`maxTokens` 是语义输出上限；Gemini 支持 `topK`）。
- `options` 每次模型调用从空开始；Request overrides > model 默认 > route 默认；provider option 对象递归合并，数组与标量替换。
- `model.request` 用于请求头和原始请求设置；`http.request`/`http.response` 只在需要原生 HTTP 交换时用（body 是一次性流，读取前需 clone 或替换）。

### 8.6 自定义工具迁移

V1 用旧 `tool()` 助手返回 `tool` map；V2 通过**同步**的 `ctx.tool.transform` 编辑器注册，schema 用 JSON Schema，执行返回结构化内容：

```ts
// V1
import { tool } from "@opencode-ai/plugin"

export const ToolsPlugin = async () => ({
  tool: {
    greeting: tool({
      description: "Create a greeting",
      args: { name: tool.schema.string() },
      async execute(args) {
        return `Hello ${args.name}!`
      },
    }),
  },
})
```

```ts
// V2
import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "greeting",
  async setup(ctx) {
    await ctx.tool.transform((editor) => {
      editor.add({
        name: "greeting",
        description: "Create a greeting",
        input: {
          type: "object",
          properties: { name: { type: "string" } },
          required: ["name"],
          additionalProperties: false,
        },
        async execute(input) {
          return { content: `Hello ${(input as { name: string }).name}!` }
        },
      })
    })
  },
})
```

工具还可：`editor.namespace({ name, description })` 建命名空间（工具名变为 `ns_name`）、`options: { namespace, codemode }`、`execute` 第二参 context 含 `signal`（可取消）和 `context.progress({ status })`。每次模型请求捕获一个稳定的工具快照，后续 transform 只影响未来快照。

### 8.7 transforms（替代 V1 的 config/provider 钩子）

V2 **没有**一个可变的全局 config 对象。把变更注册到**拥有它的领域**：`ctx.agent`、`ctx.provider`、`ctx.model`、`ctx.command`、`ctx.integration`、`ctx.mcp`、`ctx.reference`、`ctx.skill`、`ctx.tool`、`ctx.vcs`、`ctx.websearch`、`ctx.worktree`。

```ts
await ctx.provider.transform((editor) => {
  editor.update("anthropic", (provider) => {
    provider.headers = { ...provider.headers, "x-company": "engineering" }
  })
})

await ctx.model.transform((editor) => {
  editor.list("anthropic").forEach((model) => {
    if (!model.capabilities.tools) editor.remove(model.providerID, model.id)
  })
})
```

Transform 规则：

- Transforms 是**可重放的状态编辑**：回调必须**同步、廉价、无一次性副作用**。
- 外部数据先在回调外加载、在回调中捕获；数据变化后调用该领域的 `reload()`（重放全部 active transforms，不重跑 setup）。
- 后注册的 transform 能看到先注册的变更，可更新、替换或移除它们。
- 鉴权方法属于 `ctx.integration`；provider transform 提供源定义与设置；model transform 对完整活动模型集施加限制与覆盖。

### 8.8 事件订阅与清理

V1 的 `event` 回调变为对公开服务器事件流的异步订阅，在 cleanup 中 abort：

```ts
import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "notifications",
  setup(ctx) {
    const controller = new AbortController()

    void (async () => {
      for await (const event of ctx.event.subscribe({ signal: controller.signal })) {
        if (event.type === "session.idle") console.log("Session completed")
      }
    })()

    return () => controller.abort()   // 定时器、子进程、socket 等插件自有资源都在这里清理
  },
})
```

钩子与 transform 注册随插件自动清理。事件订阅是 live-only：无重放、无自动重连；可传 `{ types: [...] }` 过滤。

### 8.9 选项与持久状态

```ts
const strict = ctx.options.strict === true          // 读取插件选项
await ctx.storage.set("settings", { strict })       // 持久 JSON，按插件作用域
const settings = await ctx.storage.get("settings")
```

不要自造全局文件存插件状态，用 `ctx.storage`（方法：`get`/`set`/`remove`/`scan`）。

### 8.10 一个包同时支持 V1 与 V2（过渡期方案）

同一 default export 同时暴露两种实现：V1 调 `server()`，V2 调 `setup()`。**两套 API 独立，不会自动翻译钩子**：

```ts
import { Plugin } from "@opencode/plugin"

export default {
  ...Plugin.define({
    id: "example",
    async setup(ctx) {
      await ctx.tool.hook("execute.before", () => console.log("A tool is about to run"))
    },
  }),
  async server() {
    return {
      "tool.execute.before": async () => console.log("A tool is about to run"),
    }
  },
}
```

- V1 对象入口在 OpenCode `1.18.29` 及更新版本受支持；要支持更老的 V1 版本请用独立的包版本或入口点，并测试所声称支持的最老版本。
- 支持窗口结束后移除 V1 实现。

### 8.11 移植后的验证清单

对每个插件：

1. 确认其 ID 和来源出现在活动插件列表中。
2. 逐一运行每个注册的钩子、transform、工具、命令和事件订阅。
3. 通过重载或移除插件验证清理逻辑。
4. 用干净项目测试插件选项与持久化状态。
5. 已发布的包要测试**安装后的包**，而不只是 workspace 链接副本。

---

## 9. Server API 与客户端集成迁移

调用 V1 server API 的集成**必须**迁移到 V2 API（有意的破坏性变更）。

### 9.1 服务器认证变化

V2 仍用 HTTP Basic 认证，但有变化：

- 密码用 `OPENCODE_PASSWORD` 设置（`OPENCODE_SERVER_PASSWORD` 仍可用）。
- **`OPENCODE_SERVER_USERNAME` 不再支持**，用户名固定为 `opencode`。

```bash
# V1
OPENCODE_SERVER_USERNAME=alice OPENCODE_SERVER_PASSWORD=secret opencode serve

# V2
OPENCODE_PASSWORD=secret opencode serve
```

启动显式服务器：`opencode serve --hostname 0.0.0.0 --port 4096`；可加 `--cors <origin>`（可重复）允许浏览器来源。

### 9.2 用 `@opencode/client` 访问 V2 API

```sh
bun add @opencode/client    # 或 npm/pnpm install
```

**默认入口（Promise 风格，浏览器兼容）**：

```ts
import { OpenCode } from "@opencode/client"

const client = OpenCode.make({
  baseUrl: "http://localhost:4096",
  headers: { authorization: `Bearer ${process.env.OPENCODE_TOKEN}` },  // 默认头
})

const session = await client.session.create({ location: { directory: "/workspace" } })
await client.session.prompt({ sessionID: session.id, text: "Review the current changes" })

// 事件流：异步可迭代对象；每个 client 共享一条 lazy 连接；live-only，无重放、无自动重连
for await (const event of client.event.subscribe()) {
  console.log(event.type)
}

// 类型过滤
for await (const event of client.event.subscribe({ types: ["config.updated"] })) { /* ... */ }
```

每个操作的最后一个参数可传请求选项（`AbortSignal` 或逐请求 headers）；事件订阅例外，只接受本地取消。

**本地后台服务管理（Node 专用入口 `@opencode/client/service`）**：

```ts
import { OpenCode } from "@opencode/client"
import { Service } from "@opencode/client/service"

const endpoint = await Service.ensure()   // 发现或启动兼容服务
const client = OpenCode.make({
  baseUrl: endpoint.url,
  headers: Service.headers(endpoint),     // 生成认证头
})
const info = await client.server.info()
```

`Service.discover()` 只发现不启动；`Service.ensure()` 需要时启动；`Service.stop()` 停止注册的服务实例；`Service.headers(endpoint)` 生成认证头。`ensure` 可选参数：`file`（注册文件）、`version`（精确值或谓词如 `(v) => v.startsWith("2.")`）、`command`、`onStart`。

**Effect 入口**：`@opencode/client/effect` 返回类型化 Effect 与 Stream；Node 服务管理在 `@opencode/client/effect/service`（需 `effect` 与 `@effect/platform-node`）。

### 9.3 插件 RPC（客户端调用）

```ts
import { OpenCode } from "@opencode/client"
import { Acme } from "opencode-acme-plugin/rpc"

const acme = client.rpc(Acme)
const result = await acme.search(
  { query: "hello" },
  { location: { directory: "/workspace" }, signal: AbortSignal.timeout(10_000) },
)
const unsubscribe = acme.events.on("updated", (event) => { /* ... */ })
```

服务器端插件必须已配置并实现该 RPC，导入定义不会注册它。任何 HTTP 客户端也可直接 `POST /api/rpc/{rpcID}/{method}`，body 为 `{ "input": ... }`。

### 9.4 `opencode api` 命令（本地调试 API）

```bash
opencode api get /api/info                       # 方法 + 路径
opencode api GET /api/session -H "accept: application/json"
opencode api session.list --param limit=10       # 按 OpenAPI operation ID
opencode api session.create --data '{"title": "New session"}'
```

支持 `--data`/`-d` 传 JSON body、`--header`/`-H` 加头。注意：无健康服务时运行 `opencode api` 可能会启动后台服务。

### 9.5 V2 API 端点概览

完整 OpenAPI 规范由运行中的服务器在 `/openapi.json` 提供（V2 规范为 OpenAPI 3.1.0，约 162 个操作）。主要端点分组：

| 分组 | 代表端点 |
| --- | --- |
| server | `GET /api/info`、`POST /api/pair`、`GET /auth/connect/{code}` |
| location | `GET /api/location`、`POST /api/location/reload` |
| session | `GET/POST /api/session`、`GET/PATCH/DELETE /api/session/{id}`、`POST .../prompt`、`POST .../command`、`POST .../compact`、`POST .../interrupt`、`POST .../fork`、`GET .../message` 等 |
| model / provider | `GET /api/model`、`GET /api/provider` |
| agent / command / skill | `GET /api/agent`、`GET /api/command`、`GET /api/skill` |
| generate | `POST /api/experimental/generate/text`、`.../image`、`.../decisions` |
| integration | `GET /api/integration`、OAuth/key/command 连接系列 |
| mcp | `GET /api/mcp`、`PUT/DELETE /api/experimental/mcp/{server}`、`POST .../connect` |
| credential | `GET/POST/PATCH/DELETE /api/credential...`、`POST .../activate` |
| permission | `GET /api/permission/request`、`GET/PATCH/DELETE /api/permission/saved/{id}`、会话级请求与回复 |
| config | `GET /api/config`、`PATCH /api/experimental/config` |
| shell / vcs / worktree | `POST /api/shell`、`GET /api/vcs...`、`GET/POST/DELETE /api/worktree...` |
| filesystem | `GET /api/fs/read/*`、`GET /api/fs/list`、`GET /api/fs/find`、`POST /api/experimental/fs/write` |
| event | `GET /api/event`（订阅事件） |
| pty | `GET/POST /api/pty...`（终端会话） |
| plugin | `GET /api/plugin`、`POST /api/plugin/check`、`POST /api/plugin/update` |
| migration | `GET /api/experimental/migration/v1`（V1 迁移状态）、`POST /api/experimental/session/import` |

---

## 10. 行为变化清单（默认值差异）

这些差异不改变配置格式，但会改变行为，迁移时逐条核对：

| # | 变化 | 应对 |
| --- | --- | --- |
| 1 | **外部目录默认允许**：V1 访问项目外路径会询问，V2 不询问 | 要保持询问，加 `{ "action": "external_directory", "resource": "*", "effect": "ask" }` |
| 2 | **todos 默认关闭** | 需要时设 `"experimental": { "todo": true }`（实验性） |
| 3 | **LSP 不再运行**：不启动语言服务器、无 LSP 工具、无诊断 | 改用项目 lint / typecheck / 编译命令 |
| 4 | **只发现 `AGENTS.md`**：`CLAUDE.md` 回退不再生效 | 把内容并入 `AGENTS.md`，并可提兼容性 issue |
| 5 | **委托命令后台运行**：subagent 命令自动后台执行并汇报给父会话 | 无需动作，注意观察结果方式变化 |
| 6 | **agent 的 `request.body` 不再发给模型** | `temperature`/`top_p` 等改设到 model variant |
| 7 | **压缩字段变化**：`tail_turns`/`prune` 被忽略并警告 | 改用 `compaction.keep.tokens` |
| 8 | **provider ID 合并**：`azure-cognitive-services`→`azure`、`google-vertex-anthropic`→`google-vertex` | 迁移旧内置 provider 引用时更新 ID |
| 9 | **认证环境变量变化**：`OPENCODE_SERVER_USERNAME` 失效 | 用 `OPENCODE_PASSWORD`；用户名固定 `opencode` |
| 10 | **V1/V2 同命令不并存** | 先卸载包管理器安装的 V1 |

---

## 11. 迁移后验证清单

在依赖 V2 从事日常工作前，在一个项目里验证以下各项：

- [ ] `opencode --version` 显示 V2 版本
- [ ] 默认模型与 provider 凭据可用（界面内 `/connect` 连接 provider）
- [ ] 自定义 agents 出现且行为正常（含 primary/subagent 模式）
- [ ] 权限规则按预期工作（重点测 `bash→shell` 改名和外部目录行为）
- [ ] MCP 服务器连接正常（`opencode mcp list`；需要登录的在界面 `/mcps` 完成 OAuth）
- [ ] 所有插件出现在活动列表且功能正常（逐个验证钩子/工具/事件/清理）
- [ ] slash 命令、skills、AGENTS.md 指令正常加载
- [ ] 调用 server API 的脚本/集成已迁移并通过测试
- [ ] 终端偏好（主题、键位等）已自动迁移到 `cli.json` 并生效
- [ ] 快照/undo、压缩等行为符合预期

**保留 V1 环境直到确认所需的 V2 行为全部正常；在验证完成前不要把 V1 指向已转换成 V2 原生格式的配置。**

---

## 12. 故障排查

### 12.1 先定位问题属于哪一层

OpenCode 是客户端 + 后台服务器。按顺序排查：

```bash
opencode service status          # 服务信息
opencode api get /api/info       # API 是否健康
opencode service restart         # 卡住/不健康时重启
opencode --standalone            # 用私有服务器对比，隔离共享服务问题
```

### 12.2 日志

```bash
tail -f ~/.local/share/opencode/log/opencode.log
grep 'role=cli'   ~/.local/share/opencode/log/opencode.log   # 客户端启动
grep 'role=server' ~/.local/share/opencode/log/opencode.log  # 会话/provider/插件/权限/工具
grep 'run=<ID>'   ~/.local/share/opencode/log/opencode.log   # 单次进程运行
```

正常日志不够时，用 `OPENCODE_LOG_LEVEL=DEBUG` 运行一次复现。

### 12.3 配置问题

- 修改配置**不需要重启**：保存后自动重载；用 `/reload` 强制完整重载。
- 配置中字段的最终依据是 schema（`https://opencode.ai/config.json`），编辑器中保留 `$schema` 即可校验。
- 警告（被忽略的旧字段、格式错误值、V1/V2 冲突值）会出现在日志中。

### 12.4 兼容性 Bug

指南声明受支持的 V1 行为在 V2 中失效时，这是兼容性 Bug 而非迁移要求。报告问题时包含：

- `opencode --version` 输出
- `opencode service status` 输出
- 最小复现步骤
- 问题影响的是共享服务、特定客户端还是单个项目
- 相关日志行（含 `run` 和 `role` 字段）

**分享日志前先去除 API key、authorization 头、prompt、文件内容等敏感数据。**

### 12.5 其他诊断工具

```bash
opencode debug paths                  # 打印各本地路径
opencode debug paths db               # 只打印数据库路径
opencode debug heap-dump              # 后台服务器堆快照（Chrome DevTools 查看）
opencode service set cors <origin>    # 允许浏览器来源（逗号分隔多个）
```

---

## 13. 附录：字段速查表

### 13.1 顶层字段 V1 → V2 一览

| V1 | V2 | 备注 |
| --- | --- | --- |
| `permission` | `permissions` | 数组；`bash`→`shell`、`task`→`subagent`、`write`/`patch`→`edit` |
| `tools` | 并入 `permissions` | `tools.websearch: false` → `{action:"websearch",effect:"deny"}` |
| `agent`、`mode` | `agents` | `prompt`→`system`、`disable`→`disabled`、`variant`→`#variant`、`maxSteps`→`steps` |
| `command` | `commands` | `subtask`→`subagent` |
| `provider` | `providers` | `npm`→`package`（加 `aisdk:`）、`api`→`settings.baseURL`、`options` 拆分 |
| `plugin` | `plugins` | 元组改对象；本地路径必须是目录 |
| `reference` | `references` | V1 已接受 `references` |
| `snapshot` | `snapshots` | |
| `attachment` | `media` | 嵌套 image 设置名不变 |
| `mcp.<server>` | `mcp.servers.<server>` | `enabled`→`disabled`、`timeout`→`{catalog,execution}`、OAuth 字段 snake case |
| `compaction.preserve_recent_tokens` | `compaction.keep.tokens` | |
| `compaction.reserved` | `compaction.buffer` | |
| `compaction.tail_turns`、`compaction.prune` | （无，被忽略） | 用 `keep.tokens` |
| `skills.paths` + `skills.urls` | `skills`（单数组） | |
| `autoupdate` | `update` | `false`→`"disable"`、`true`→`"auto"`；仅全局生效 |
| `small_model` | `agents.title.model` | |
| `enabled_providers` / `disabled_providers` | `policies`（自动转换） | 可保留 V1 语法 |
| `logLevel`、`server`、顶层 `subagent_depth` 等 | 见 5.13 | 被忽略并警告 |
| `shell`、`model`、`default_agent`、`watcher`、`formatter`、`instructions`、`enterprise`、`tool_output`、`lsp` | 不变 | `lsp` 配置保留但功能移除 |

### 13.2 模型字段 V1 → V2

| V1 | V2 |
| --- | --- |
| `id` | `modelID` |
| `tool_call`、`modalities` | `capabilities.tools` / `capabilities.input` / `capabilities.output` |
| `status: "deprecated"` | `disabled: true` |
| `cache_read` / `cache_write` | `cache.read` / `cache.write` |
| `options` | `settings` |
| `variants` 对象 | `variants` 数组，每项 `{ id, settings, body }` |

### 13.3 .opencode/ 目录 V1 → V2

| V1 位置 | V2 推荐 | 说明 |
| --- | --- | --- |
| `.opencode/agent/`、`.opencode/agents/` | `.opencode/agents/<name>.md` | 四个旧目录都仍被发现 |
| `.opencode/mode/`、`.opencode/modes/` | `.opencode/agents/<name>.md` + frontmatter `mode: primary` | |
| `.opencode/command/`、`.opencode/commands/` | `.opencode/commands/<name>.md` | 同相对路径移动保留命令名 |
| `.opencode/skill/<id>/` | `.opencode/skills/<id>/SKILL.md` | 整目录移动，目录名即 skill ID |
| `CLAUDE.md` 回退 | 并入 `AGENTS.md` | V2 只发现 `AGENTS.md` |

### 13.4 插件 API V1 → V2 速查

| V1 | V2 |
| --- | --- |
| `@opencode-ai/plugin` | `@opencode/plugin` |
| 导出异步插件函数 | `export default Plugin.define({ id, setup(ctx) })` |
| 返回 `{ tools, hooks }` 对象 | 在 `setup` 中按领域注册 |
| `client` 属性 | `ctx.<domain>`（session/permission/agent/...） |
| `directory` / `project` | `ctx.location.directory` / `ctx.location.project` |
| 钩子字符串 key + `(input, output)` | `ctx.<domain>.hook(name, (event) => ...)` 单可变 event |
| `config` / `provider` 钩子 | 领域 `transform(...)` |
| `tool()` 助手 + `args` | `ctx.tool.transform` + JSON Schema `input`，返回 `{ content }` |
| `event` 回调 | `ctx.event.subscribe()`（AbortController 清理） |
| `dispose()` 钩子 | `setup` 返回的 cleanup 函数 |
| 插件选项参数 | `ctx.options` |
| 自造状态文件 | `ctx.storage` |
| `$` Bun shell 助手 | 自管进程 API |

---

*本指南基于 OpenCode V2 官方文档整理。字段完整性与可接受值以配置 schema（`https://opencode.ai/config.json`）为最终依据；实验性字段（`experimental.*`）可能随时变更或移除。*
