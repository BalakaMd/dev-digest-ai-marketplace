# Security

Plugins execute inside developers' Claude Code sessions, so a bad release has a wide blast radius.

## Forbidden in any file

- Secrets: API keys, tokens, passwords, private keys, `.env` content.
- Absolute paths (`/Users/...`, `C:\...`) — use `${CLAUDE_PLUGIN_ROOT}` / `${CLAUDE_SKILL_DIR}`.
- Credentials in `plugin.json` or `marketplace.json`.
- Network-calling hooks or MCP servers without an explicit entry in the plugin README.

## Least privilege

Every agent declares the minimal `tools` it needs. Read-only agents (`researcher`,
`architecture-reviewer`, `plan-verifier`) must not list `Edit` or `Write`.

## Reviewing a release

CODEOWNERS plus a branch ruleset require review by the owning team. Reviewers check
tools/permissions, hooks and scripts first, prose last.

## Response to an unsafe release

1. Stop recommending it: pull the entry from the `latest` channel or fix forward immediately.
2. Point the `stable` marketplace at the last good tag (see `docs/RELEASES.md`, rollback).
3. Publish a patch release removing the problem; note it in the plugin `CHANGELOG.md`.
4. If a secret leaked: rotate it first, then clean history.
5. Describe external state the plugin may have changed and how to restore it.
