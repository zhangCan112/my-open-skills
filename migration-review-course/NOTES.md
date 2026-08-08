# NOTES

## 用户偏好

- 教程用**中文**，术语保留英文原名（如 MISSING/PARTIAL/DIFFERS）
- 交付顺序：**先教程，后 skill**。学完再做方法论 meta-skill
- skill 形态：**方法论 meta-skill** —— 未来对具体场景"生成"迁移 review / 检查 skill（类似 dependency-migrator 的模板模式）
- 写 skill 时必须参考 `writing-for-agents` 的规范
- 教学环境独立放在 `migration-review-course/`，不污染仓库根目录

## 工作区结构

- `lessons/0001-NNNN.html` — 课程（自包含 HTML）
- `reference/` — 速查表、术语表
- `learning-records/` — 每课学完的 ADR
- `assets/` — 复用组件（shared.css、quiz.js）

## 待办

- [ ] 学完 6 课后写 learning-records
- [ ] 根据最终方法论产出 meta-skill
