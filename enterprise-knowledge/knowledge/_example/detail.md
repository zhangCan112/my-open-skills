# Example Entry: {{INTERNAL_FRAMEWORK}}

## Overview
`{{INTERNAL_FRAMEWORK}}` is our internal framework for {{PURPOSE}}. This entry documents the approved usage pattern; prefer the standard helper over raw framework calls.

## Usage / Conventions

1. Use the standard helper `{{HELPER}}` instead of `{{INTERNAL_FRAMEWORK}}` directly.
2. Configure via `{{CONFIG_FILE}}` rather than hardcoding values.
3. Follow the team's {{CONVENTION}} for naming and lifecycle management.

## Code Examples

### Correct
[Recommended code, or reference: `examples/correct.example`]

```example
// Use the standard helper
{{HELPER}}.{{METHOD}}({{ARGS}});
```

### Incorrect (optional)
[What to avoid, or reference: `examples/incorrect.example`]

```example
// Avoid raw framework usage
var x = new {{INTERNAL_FRAMEWORK}}.{{CLASS}}();
```

## Common Pitfalls
- Forgetting to register `{{INTERNAL_FRAMEWORK}}` in the lifecycle, causing leaks.
- Hardcoding config that should live in `{{CONFIG_FILE}}`.

## References (optional)
- Internal wiki: {{WIKI_LINK}}
- Related entry: {{RELATED_ENTRY}}
