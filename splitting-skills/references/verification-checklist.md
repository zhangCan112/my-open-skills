# Phase 4 Verification Checklist

Reference material for the Verification Output phase. Load when performing Phase 4.

## Verification Checklist

| Check | Description | Pass Condition |
|-------|-------------|----------------|
| **Coverage** | Every node from original input is assigned to a sub-skill | No orphaned nodes |
| **Independence** | Each sub-skill can be understood and used independently | No unresolved internal references |
| **Standards Compliance** | Each SKILL.md follows writing-skills conventions | Frontmatter correct, structure complete |
| **Dependency Completeness** | All cross-skill references have corresponding declarations | Requires/Required by forms a closed loop |
| **No Redundancy** | No unnecessary content duplication | Duplicated lines between generated SKILL.md files < 5% |
| **Resource Attribution** | Referenced files/scripts correctly allocated | No dangling references |
| **Testability Reminder** | Each generated skill is a candidate for TDD validation | Remind user to test per writing-skills Iron Law |

## Testing Guidance

Generated skills are NOT automatically tested — testing is the user's responsibility. Phase 4 MUST:

1. **Remind the user** that each generated skill should be tested following the `writing-skills` TDD process (RED-GREEN-REFACTOR with pressure scenarios)
2. **Suggest priority order:** start with leaf skills (no `Requires`) since they have no downstream dependencies
3. **Flag skills** most likely to need testing attention — skills with high dependency counts or complex resource allocations
