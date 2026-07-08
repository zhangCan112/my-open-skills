# Splitting Strategies Reference

## Hierarchy Strategy

**When to use:** Input has clear hierarchical structure (h1 > h2 > h3, or nested sections).

**How it works:** Split by hierarchy boundaries. Each significant subtree becomes its own skill.

**Example:**

```
Original:
├── Overview (h1)
├── Setup (h1)
│   ├── Prerequisites (h2)
│   └── Installation (h2)
├── Usage (h1)
│   ├── Basic (h2)
│   └── Advanced (h2)
└── Troubleshooting (h1)

Split:
- skill-overview (Overview section)
- skill-setup (Setup + children)
- skill-usage (Usage + children)
- skill-troubleshooting (Troubleshooting section)
```

**Granularity control:**
- Fine: Each h2 section becomes a skill
- Medium: Each h1 section becomes a skill
- Coarse: Groups of related h1 sections become a skill

---

## Process Strategy

**When to use:** Input describes workflows, stages, or sequential steps with causal dependencies.

**How it works:** Identify process stages by looking for temporal markers (first, then, next, after, finally), phase labels, or step numbering. Each stage becomes a skill.

**Example:**

```
Original:
1. Planning Phase
   - Gather requirements
   - Define scope
2. Design Phase
   - Architecture design
   - API design
3. Implementation Phase
   - Write code
   - Write tests
4. Deployment Phase
   - CI/CD setup
   - Release process

Split:
- skill-planning (Planning Phase)
- skill-design (Design Phase)
- skill-implementation (Implementation Phase)
- skill-deployment (Deployment Phase)
```

**Granularity control:**
- Fine: Each sub-step becomes a skill
- Medium: Each phase becomes a skill
- Coarse: Groups of phases become a skill (e.g., planning+design, implementation+deployment)

---

## Element Strategy

**When to use:** Input contains multiple independent concerns or functional areas that are largely orthogonal.

**How it works:** Identify elements by looking for sections that have high independence scores (>0.7), minimal cross-references, and self-contained concepts. Each element becomes a skill.

**Example:**

```
Original skill covering a web framework:
- Routing
- Authentication
- Database access
- Template rendering
- Error handling

Split:
- skill-routing (Routing)
- skill-authentication (Authentication)
- skill-database (Database access)
- skill-templates (Template rendering)
- skill-errors (Error handling)
```

**Granularity control:**
- Fine: Each atomic concern becomes a skill
- Medium: Related concerns grouped into a skill (e.g., routing+errors, auth+database)
- Coarse: Two or three major domain clusters

---

## Nine-Grid Strategy

**When to use:** Input is a complex system that cannot be cleanly decomposed along a single dimension. Two orthogonal axes are needed.

**How it works:** Identify two independent dimensions that organize the content (e.g., complexity level × lifecycle stage, frontend/backend × feature area). Create a 3×3 matrix and map nodes into cells. Each cell or group of cells becomes a skill.

**Dimension selection guidance:**
- Look for two axes the original author implicitly uses
- Common pairs: complexity × stage, layer × feature, role × activity
- Each dimension should have 2-4 natural levels

**Example:**

```
Dimensions: Complexity (basic/advanced/expert) × Stage (setup/usage/troubleshooting)

         Setup        Usage        Troubleshooting
Basic    [Grid A]     [Grid B]     [Grid C]
Advanced [Grid D]     [Grid E]     [Grid F]
Expert   [Grid G]     [Grid H]     [Grid I]

Split (medium granularity — group rows):
- skill-basic (Grids A+B+C)
- skill-advanced (Grids D+E+F)
- skill-expert (Grids G+H+I)
```

**Granularity control:**
- Fine: Each cell becomes a skill (up to 9)
- Medium: Group by one dimension (rows or columns, 3-4 skills)
- Coarse: Group by quadrants (2-4 skills)
