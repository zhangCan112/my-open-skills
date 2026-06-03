# Example Rule: {{OLD_API}} to {{NEW_API}} - Replacement Solution

## Replacement Steps

1. Identify the {{OLD_API}} usage pattern (initialization, configuration, method calls)
2. Map each {{OLD_API}} call to its {{NEW_API}} equivalent
3. Update import statements from old module to new module
4. Adjust any callback/delegate patterns to match {{NEW_API}} API style
5. Remove any boilerplate code that {{NEW_API}} handles automatically

## Before / After Examples

### Before
[Original code, or reference: `examples/before.example`]

```example
// {{OLD_API}} usage
```

### After
[Replaced code, or reference: `examples/after.example`]

```example
// {{NEW_API}} equivalent
```

## Edge Cases (optional)
- If {{OLD_API}} is used with {{SPECIAL_FEATURE}}, this requires additional handling because {{NEW_API}} handles it differently
- Multiple {{OLD_API}} instances in the same scope may share state — ensure {{NEW_API}} replacements maintain the same behavior

## Notes (optional)
Common pitfall: forgetting to update {{RELATED_CONFIGURATION}} which is tied to the old API but not obviously connected.
