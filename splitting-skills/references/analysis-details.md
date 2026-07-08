# Phase 1 Analysis Details

Reference material for the Structure Analysis phase. Load when performing Phase 1.

## Input Types

| Input Type | Detection Signals | Processing |
|------------|-------------------|------------|
| **SKILL.md file** | YAML frontmatter, markdown heading hierarchy | Decompose by heading levels into node tree |
| **Arbitrary structured knowledge** | Indentation levels, numbered lists, XML/JSON trees, mind map text | Parse by structural markers into node tree |

## Input Scope — Resource Aware

Handle the complete resource tree, not just the main file:

1. **Identify input scope:**
   - Main file (SKILL.md or other primary document)
   - Referenced files (markdown reference docs, scripts, templates)
   - External dependencies (other skills, tool chain requirements)

2. **Build complete resource tree:**

   ```
   main-skill/
   ├── SKILL.md            ← Main document
   ├── reference.md        ← Referenced documentation
   ├── scripts/
   │   └── tool.sh         ← Referenced script
   └── examples/
       └── demo.md         ← Example file
   ```

## Parsing Process

1. **Read complete input content** including all referenced resources
2. **Identify structural markers:** markdown headings, indentation levels, numbering (1. 1.1 1.1.1), XML/JSON hierarchy
3. **Build node tree:** each identifiable semantic unit (section, module, functional block) as a node
4. **Annotate each node:**
   - **Node type:** concept / process / rule / reference / tool / script
   - **Size:** line count or token estimate
   - **Dependencies:** inter-node references, prerequisites
   - **Independence score:** 0-1 (see calculation below)
   - **Associated resources:** external files referenced by or referencing this node

## Independence Score

Computed as average of three components:

- **Reference autonomy** (0-1): How few references this node makes to other nodes (0 = heavy references outward, 1 = self-contained)
- **Incoming coupling** (0-1): How few other nodes reference this node (0 = referenced by many, 1 = isolated)
- **Semantic completeness** (0-1): Whether this node contains a complete concept/process (0 = fragment, 1 = complete unit)

Thresholds:
- **>0.7:** Highly independent — strong candidate for Element strategy
- **0.4-0.7:** Moderately coupled — needs dependency-aware strategy (Process or Hierarchy)
- **<0.4:** Heavily coupled — splitting may require significant dependency management

## Early Exit Criteria

If analysis shows any of these conditions, recommend NOT splitting and explain why:

| Condition | Signal | Recommendation |
|-----------|--------|----------------|
| Too small | Total nodes < 3 or total content < 50 lines | "Input is too small to benefit from splitting" |
| Already optimal | All nodes have independence score > 0.8 and structure is flat | "Input is already well-structured as a single skill" |
| No structure detected | Cannot identify hierarchy, process, or independent elements | "Input lacks discernible structure for splitting" |
| Unresolvable circular deps | All nodes form a single dependency cycle with no entry point | "Input has circular dependencies that prevent clean splitting" |

If an early exit is triggered, present the finding and stop. User may override with explicit instruction to proceed anyway.

## Circular Dependency Handling

If circular dependencies are detected:

1. Identify the minimal cycle set
2. Attempt to break cycles by finding shared abstractions that can be extracted into a separate skill
3. If cycles cannot be broken, present options to the user:
   - Extract shared portion into a new utility skill
   - Merge the cyclic nodes into a single skill
   - Proceed with documented circular dependencies (not recommended)
