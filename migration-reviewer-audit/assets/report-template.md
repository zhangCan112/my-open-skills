# Behavioral Equivalence Report

**Migration:** {{SOURCE}} → {{TARGET}}
**Scope:** {{SCOPE}}
**Date:** {{DATE}}
**Auditor:** {{AUDITOR}} (agent: migration-reviewer)

## 1. Summary

| Metric | Count |
|---|---|
| Behaviours enumerated | {{N}} |
| Gaps (MISSING / PARTIAL / DIFFERS) | {{M}} / {{P}} / {{D}} |
| Rules verified equivalent | {{N}} |
| Rules improved (intentional) | {{N}} |
| Rules different (needs review) | {{N}} |
| Rules missing | {{N}} |

**Conclusion:** {{RELEASE / FIX-FIRST / NEEDS-DOMAIN-REVIEW}}
**Verification tier used:** {{TIER}} — {{why this tier}}

## 2. Rule-by-rule verification

| ID | Description | Legacy location | New location | Status |
|---|---|---|---|---|
| BR-001 | … | `file:line` | `file:line` | Equivalent |
| BR-002 | … | `file:line` | not found | Missing |
| … | | | | Different |

## 3. Behaviour differences

| # | Category | Legacy behaviour | New behaviour | Classification | Severity |
|---|---|---|---|---|---|
| 1 | branch/error/i18n/… | … | … | intentional / acceptable deviation / regression | high/med/low |

Intentionality is only decided by a domain expert, not the auditor.

## 4. Missing rules / behaviours

| ID | Legacy location | Why missing | Risk | Action |
|---|---|---|---|---|
| … | `file:line` | not implemented / consolidated / obsolete | … | implement / confirm with expert / n/a |

## 5. Edge cases & invariants

| Case / invariant | Legacy behaviour | New behaviour | Status |
|---|---|---|---|
| null input → | defaults | throws | different |
| status machine: pending → shipped (skip confirmed) | blocked | allowed | regression |
| mechanism change (app → DB constraint) | … | … | documented |

## 6. Integration points

| Consumer / contract | Legacy | New | Match |
|---|---|---|---|
| error code on failure | `4010` | `4000` | no |
| response field ordering | … | … | yes |

## 7. Recommendation

- [ ] Release (all equivalent; differences acceptable)
- [ ] Fix first: {{list}}
- [ ] Needs domain review: {{list}}

**Sign-off (HITL gate):** the legacy system is not retired until a domain expert signs below.

- Engineering lead: __________________
- Domain expert: __________________   Date: ____________