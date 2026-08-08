# Migration Reviewer — Audit

The **audit half** of the migration-reviewer pair: given a real before→after code migration, checks for missed functionality and silently changed business logic, and produces a **Behavioral Equivalence Report** (six-piece methodology, MISSING/PARTIAL/DIFFERS classification, explicit verification tier, human sign-off gate).

Use this when you already have the migration in flight and the two sides of code to compare. If you instead need a reusable migration-review checklist/skill for a scene, use `migration-reviewer-generate`.

## How to use

Give the agent the two sides of code (paths, or a scope description) and what evidence exists:

> 审查 PaymentService 从 Java 单体迁到 Go 微服务的这次迁移，`app/legacy` 是旧代码，`svc/payments` 是新代码，比较前后行为是否完整、业务规则有没有悄悄变。

The agent grounds the scope, builds the behavior inventory, classifies gaps, and returns a Behavioral Equivalence Report pending your sign-off.

## License

MIT