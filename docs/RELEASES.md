# Releases

## Versioning

Each plugin is versioned independently with SemVer (`MAJOR.MINOR.PATCH`):

- PATCH — wording fixes, bug fixes without behavior change.
- MINOR — backward-compatible behavior (a stricter check, a new skill).
- MAJOR — breaking change (renamed component, removed skill, changed contract).

The version lives only in `plugins/<name>/.claude-plugin/plugin.json`.

## Tags

One tag per plugin release, in the form Claude Code expects for Git-backed dependencies:

```
engineering-paved-path--v1.0.0
research-tools--v1.0.0
architecture-review--v1.0.0
sdd-engineering--v1.0.0
```

From the plugin directory:

```sh
claude plugin tag --dry-run
claude plugin tag --push
```

A tag must point to a commit that passed CI and is never moved.

## Release order

Dependencies first, consumer last: `engineering-paved-path` → `research-tools` →
`architecture-review` → `sdd-engineering`. Before each release review `CHANGELOG.md`,
the commit SHA and the eval results.

## Updating (consumer side)

```sh
claude plugin marketplace update dev-digest-ai-marketplace
claude plugin update <plugin>@dev-digest-ai-marketplace --scope project
```

Then run `/reload-plugins` or start a new session.

## Channels

| Channel | Marketplace | Points at |
|---------|-------------|-----------|
| `latest` | `dev-digest-ai-marketplace` | `main` |
| `stable` | `dev-digest-ai-marketplace-stable` | a pinned ref or SHA of a verified release |

## Rollback

There is no `plugin rollback` command. Roll back by switching channel:

1. Remove or disable the current plugin: `claude plugin uninstall <plugin>@dev-digest-ai-marketplace --scope project`.
2. Add the `stable` marketplace (pinned to the release ref/SHA) and install from it.
3. `/reload-plugins`, then run the smoke eval.
4. Return to `latest` only after the command sequence is recorded and plugin data is confirmed intact.

If the plugin could change external state, document how to restore it in the plugin README.
