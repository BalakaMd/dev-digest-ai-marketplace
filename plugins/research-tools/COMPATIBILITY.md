# Compatibility

Minimum Claude Code version: **2.1.110**, aligned with the other plugins in this marketplace.
This plugin has no dependencies of its own.

## Requirements

- `git` for repository history questions.
- Web access (`WebSearch`, `WebFetch`) for external questions; without it the agent reports the
  external part as "Not found".

## Known limits

- Read-only behaviour for Bash is enforced by the agent prompt, not by a hook.
