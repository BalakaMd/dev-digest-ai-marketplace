# Compatibility

## Claude Code

Minimum version: **2.1.110**. This plugin declares version-constrained dependencies
(`{ "name": ..., "version": "^1.0.0" }`), which need that release. If you adopt a newer
capability, list it here and raise the minimum from the official documentation.

## Requirements

| Requirement | Why |
|-------------|-----|
| `jq` on `PATH` | The guard hook parses the hook payload. Without it, guarded agents' write and Bash calls are denied with a clear message |
| `git` | `run-plan` records the base commit; `plan-verifier` reads diffs |
| Dependency plugins `engineering-paved-path`, `research-tools`, `architecture-review` | Installed automatically; `run-plan` reports any that are missing |

## Known limits

- Plugin agents cannot declare `hooks`, `permissionMode` or `mcpServers` in their frontmatter
  (Claude Code ignores them). Write limits therefore live in `hooks/hooks.json`, and edits by
  `spec-creator` and `implementation-planner` follow your normal permission mode.
- No `test-writer` or `doc-writer` agent ships with this plugin. When the project defines
  agents with those names, the planner can use them in multi-agent mode; otherwise each
  implementer writes the tests of its own group.
- The `workflow-retro` deep mode reads local session journals under `~/.claude/projects/`, a
  format that is not a public contract.
