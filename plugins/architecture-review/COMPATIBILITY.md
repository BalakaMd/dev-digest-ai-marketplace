# Compatibility

Minimum Claude Code version: **2.1.110** (version-constrained dependency on
`engineering-paved-path`).

## Requirements

| Requirement | Why |
|-------------|-----|
| `jq` on `PATH` | The guard hook parses the hook payload; without it the reviewer's Bash calls are denied with a clear message |
| `git` | Scope detection and diffs |
| `engineering-paved-path` plugin | Installed automatically |

## Known limits

- Plugin agents cannot declare `hooks` or `permissionMode` in frontmatter (Claude Code ignores
  them), so the Bash limit lives in `hooks/hooks.json`.
- Quality depends on the repository documenting its architecture rules.
