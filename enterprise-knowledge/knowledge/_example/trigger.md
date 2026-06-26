# Example Entry: {{INTERNAL_FRAMEWORK}}

## Applicable Scenarios
Code uses `{{INTERNAL_FRAMEWORK}}` for {{PURPOSE}}. Look for:
- Import statements referencing `{{INTERNAL_MODULE}}`
- Class instantiation: `{{INTERNAL_FRAMEWORK}}.{{CLASS}}()`
- Configuration files mentioning `{{INTERNAL_FRAMEWORK}}`

This entry also answers queries like:
- "How do we {{PURPOSE}} in our codebase?"
- "What is the correct way to use {{INTERNAL_FRAMEWORK}}?"

## Match Triggers (optional)
- Keywords: `{{INTERNAL_FRAMEWORK}}`, `{{INTERNAL_MODULE}}`
- File patterns: `{{CONFIG_FILE}}`

## Exclusion Conditions (optional)
- Code that already wraps `{{INTERNAL_FRAMEWORK}}` in our standard helper `{{HELPER}}`
- Usage in legacy modules scheduled for removal

## Notes (optional)
Be careful to distinguish `{{INTERNAL_FRAMEWORK}}` from the similar public library `{{SIMILAR_PUBLIC_LIB}}`. Check whether the project's standard helper is available before recommending raw framework usage.
