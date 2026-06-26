---
name: enterprise-knowledge
description: Use when a developer asks about internal or enterprise frameworks, APIs, coding conventions, or company-specific code patterns; when writing code that touches internal libraries and correct usage is unclear; or when wanting to record or add new internal knowledge to the knowledge base.
---

# Enterprise Knowledge

## Overview

A queryable knowledge base for enterprise internal code and frameworks. Knowledge lives in a structured library under `knowledge/` (each entry = `trigger.md` + `detail.md`). This skill has two fixed modes: a **Query Mode** that surfaces relevant knowledge, and an **Add Mode** that interviews you to author new entries.

**Core principle:** The workflows below are fixed. Knowledge grows only by adding entries under `knowledge/`. Never edit SKILL.md or the scripts to add knowledge.

## When to Use

```dot
digraph mode_routing {
    "User need" [shape=diamond];
    "Query Mode\n(recall / apply knowledge)" [shape=box];
    "Add Mode\n(record new knowledge)" [shape=box];

    "User need" -> "Query Mode\n(recall / apply knowledge)" [label="ask about internal code/framework,\nor write code needing internal knowledge"];
    "User need" -> "Add Mode\n(record new knowledge)" [label="want to add/record\nnew internal knowledge"];
}
```

Pick **Query Mode** when the user asks about internal frameworks/APIs/conventions, or when code is being written and internal knowledge is needed.
Pick **Add Mode** when the user wants to record or add new internal knowledge.

## Query Mode

```dot
digraph query_flow {
    "Step 1: Load Index" [shape=box];
    "Step 2: Identify Relevance" [shape=box];
    "Step 3: Load & Verify" [shape=box];
    "Step 4: Respond" [shape=doublecircle];
    "Stop" [shape=doublecircle];

    "Step 1: Load Index" -> "Step 2: Identify Relevance";
    "Step 2: Identify Relevance" -> "Step 3: Load & Verify" [label="matches found"];
    "Step 2: Identify Relevance" -> "Stop" [label="no matches"];
    "Step 3: Load & Verify" -> "Step 4: Respond" [label="verified"];
    "Step 3: Load & Verify" -> "Stop" [label="all discarded"];
}
```

**Violating the letter of this workflow is violating the spirit of this skill.**

### Step 1: Load Index

Call `python scripts/load_index.py` (from the skill directory). This recursively reads all `knowledge/**/trigger.md` (skipping any path component starting with `_`) and returns XML-wrapped merged output.

```
<entries count="N">
<entry name="frameworks/spring-boot">
[trigger.md content]
</entry>
...
</entries>
```

Do NOT skip this step. The script output is the authoritative source of what knowledge exists. Do not rely on memory or guess.

### Step 2: Identify Relevance

Using all triggers from Step 1 as match criteria, identify relevant entries. Both paths are valid:

- **Proactive:** scan code in the current context for patterns described in triggers (imports, API calls, keywords, config).
- **Reactive:** match the user's question or intent against triggers.

Collect the path-names of hit entries (e.g., `frameworks/spring-boot`). Be thorough — do not stop at the first match.

If no entry matches, report that clearly — Query Mode ends here. Do not fabricate knowledge that is not in the library.

### Step 3: Load & Verify

For all matched entries:

1. Call `python scripts/load_details.py <entry-name>...` with all matched path-names.
2. Read each detail. If it references code files (e.g., `examples/correct.ext`), read them on demand.
3. Cross-validate: use the detail to confirm the entry genuinely applies to the matched context.
4. **Discard false positives** — only retain entries that pass validation.

Do NOT skip this step. Raw trigger matching is too loose; detail context is required to confirm applicability. If all entries are discarded, report that clearly.

### Step 4: Respond

Use the verified knowledge to answer the query, or proactively surface applicable knowledge: cite entry names, file locations, code snippets, and concrete recommendations.

This skill **presents and advises**. It does not edit code. If changes are warranted, describe them and let the user (or another skill) apply them.

## Add Mode

When the user wants to record or add new internal knowledge, follow the guided authoring workflow:

```
dedup-check -> locate -> scaffold -> interview trigger -> interview detail -> quality-check -> confirm
```

**The full Add Mode workflow lives in `add-mode.md`. Load that file when entering Add Mode.** It is intentionally kept out of this file so the primary Query workflow stays lean. Do not execute Add Mode from memory — read `add-mode.md` first.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Skipping Step 1 (Query) and answering from memory | Always run load_index.py first |
| Skipping Step 3 (Query) and presenting unverified matches | Always load details and cross-validate |
| Fabricating knowledge not in the library | Only answer from loaded entries; if absent, say so |
| Entering Add Mode without reading add-mode.md | Load add-mode.md first; do not run Add Mode from memory |
| Editing SKILL.md or scripts to add knowledge | Only add directories under knowledge/ |
