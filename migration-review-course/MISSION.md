# 任务：掌握代码迁移 review 方法论

## 为什么

我需要可靠地审查"代码迁移"（框架升级、语言重写、架构改造）的成果——尤其是对比迁移**前后**，找出有没有**功能遗漏**或**业务行为悄悄变化**。纯靠人眼 diff 会漏，纯靠直觉会踩坑。我想要的是一套经得起推敲的方法论，最终能把它固化成一个 meta-skill：拿到任意具体迁移场景，就能"生成"一份对应的迁移 review / 检查 skill。

## 成功的样子

- 能对一个迁移场景**系统性枚举**旧代码的行为（分支、守卫、错误路径、i18n、副作用），而不是"扫一眼代码"
- 能把每个差异**分类**为 MISSING / PARTIAL / DIFFERS（行为层）与 Equivalent / Improved / Different / Missing（业务规则层）
- 能识破**隐性行为**（默认值、排序、时序、日志、错误格式）——迁移中最容易漏的部分
- 能为迁移选择正确的**验证梯队**（静态比对 → characterization 测试 → shadow 流量 → 数据对账）
- 能产出结构化的 **Behavioral Equivalence Report**，并设置"领域专家签字"这个人类闸门
- 最终：能用这套方法论写出 meta-skill，针对具体场景生成迁移 review skill（遵循本仓库 writing-for-agents 的规范）

## 约束

- 教程使用中文（术语保留英文原名）
- 先交付教程、我学完；之后产出方法论 meta-skill
- 写 skill 时参考 `writing-for-agents` 的规范
- 本教学工作区独立放在 `migration-review-course/` 目录，不污染 skills 仓库根目录

## 超出范围

- 具体框架/语言的迁移工具用法（如 2to3、React codemod）——只讲方法论
- 通用代码 review（不是迁移场景）——本教程专注"迁移前后对比"
- 数据迁移的完整执行细节——只涉及"验证数据一致性"这一面
