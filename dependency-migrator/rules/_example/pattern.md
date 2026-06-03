# Example Rule: {{OLD_API}} to {{NEW_API}}

## Match Conditions
Code uses `{{OLD_API}}` for {{PURPOSE_DESCRIPTION}}. Look for:
- Direct instantiation: `{{OLD_API}}()`
- Method calls on {{OLD_API}} instances
- Import statements referencing the old module

## Exclusion Conditions (optional)
- Code that already imports or uses `{{NEW_API}}`
- {{OLD_API}} usage in test files that intentionally test the old implementation

## Notes (optional)
Be careful to distinguish between {{OLD_API}} and similar-looking APIs like {{SIMILAR_API}}. Check surrounding context to determine the actual usage pattern before matching.
