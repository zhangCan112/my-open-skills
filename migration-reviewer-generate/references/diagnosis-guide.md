# Diagnosis guide — A6 scene confirmation + grill tree (Phase 0–1)

This skill has exactly one scene: **adapter relocation / re-host (A6)**. Two questions decide everything: **is the scene really A6**, and **what artifact to produce**. Diagnose from context first, then grill only the gaps.

## A. Confirm the A6 scene

Adapter relocation / re-host (适配器搬迁): the same adapter module is re-hosted from App A to App B; the framework-facing side of the adapter is unchanged. Example: `framework → adapter core → host-A glue → App A` becomes `framework → adapter core → host-B glue → App B`.

All three must hold, or it is not this skill's scene:

1. **Same adapter module moves** (ported or re-attached — not a newly written adapter).
2. **The host changes** App A → App B (different app/framework/launcher with its own conventions).
3. **The framework-facing side is unchanged** (only the host side is rewired).

If any fails — cross-language rewrite, framework upgrade, service split, DB→app, library swap — say so and stop; do not force the A6 checklist onto it.

## B. Partition the scene (before any diffing)

Three zones; every line in scope goes to exactly one:

| Zone | What it is | Oracle |
|---|---|---|
| pure core logic | translation, validation, decisions | the legacy core |
| acquisition seams (inside the core) | env/config keys, DI, clock, downstream providers | expected re-pointed to B → `RE-POINTED` verify rows |
| host glue | param/field names, error codes & text, payload shapes, logging prefixes, DI/lifecycle registration | host B's contract |

**Partition heuristic, per line: "would this line change if the host were C (a third host)?"** Yes → seam or glue. No → pure core. Ambiguous lines default to seam/glue — the safer error is re-verifying, not assuming identity.

**Seam enumeration is a scan, not a memory test**: grep the core for imports of host facilities, env/config reads, DI lookups, clock calls, downstream endpoints. The category list is a prompt — what actually counts as a seam is decided by this scene's code, then confirmed with the user. Never write "no seams" from memory.

**B's contract**: if host B's rules are not written down, enumerating them (B's docs, B's framework conventions, sibling adapters already running in B, middleware/lifecycle source) is a prerequisite deliverable — glue cannot be verified against an oracle that does not exist.

The two A6-only sweeps (B-touchpoint conformance, legacy-A residue) and the preserve/translate/degrade/drop mapping for unhostable behaviors are defined in `methodology.md` ("Dual-oracle variant"). Worked micro-example: `assets/smoke-example/fixtures/adapter/`.

## C. Classify the artifact type

Read the user's request. Each points to a different output:

| User says | Artifact |
| --- | --- |
| "写个迁移 review 的 skill" | standalone skill (`assets/skill-template.md`) |
| "给这个 skill 补一条迁移规则" | rule block in existing skill (`assets/rule-template.md`) |
| "给 agent 加个迁移审查主题" | agent topic / persona (`assets/agent-topic-template.md`) |
| "出个这次迁移的检查清单" | one-off checklist (can be a short doc, no files) |
| not clear | pick "inferred later"; default to a checklist, and confirm with user |

## D. Facts to settle minimum (before Phase 2)

1. **Host A → host B** — apps/frameworks/paths of the old and new host regions.
2. **Scope** — the adapter module + glue paths to diff, and what's out.
3. **Evidence** — what files/tests run; which verification tier reachable. (tier hierarchy: static → characterization/golden master → shadow traffic → data reconciliation)
4. **Artifact form** — from section C.

Everything else is branch/optional; have a recommended default and say when you're assuming.

## E. Optional branch questions (ask one at a time, only if scene leaves them open)

- Riskiest core logic in scope (validation rules, ordering guarantees, money)? → gets the highest tier.
- Downstream parsing error text / status codes / ordering? → hidden behaviour need.
- Core behaviors B's environment cannot host? → preserve/translate/degrade/drop mapping, each documented.
- Who owns B's contract (docs? conventions? nobody → prerequisite deliverable)?

## When to stop

Stop when 1–4 confirmed (either stated by the user or inferred and explicitly confirmed). Ask the branch questions only if a gap remains. Otherwise move directly to Phase 2.
