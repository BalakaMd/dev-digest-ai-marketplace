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
| `stable` | `dev-digest-ai-marketplace-stable` | the `stable` branch: a manifest that pins every plugin to a verified release tag and commit |

The `stable` branch holds only `.claude-plugin/marketplace.json` and a README. Each plugin entry
uses a `git-subdir` source with `ref` (the release tag) and `sha` (the exact commit):

```json
{ "name": "sdd-engineering",
  "source": { "source": "git-subdir", "url": "https://github.com/BalakaMd/dev-digest-ai-marketplace.git",
              "path": "plugins/sdd-engineering", "ref": "sdd-engineering--v1.0.0", "sha": "adbbfe66c1d43247c2f8fa271ca1777cb2ca398e" } }
```

All four plugins are pinned, so the dependencies resolve inside the same pinned marketplace. To move
the channel to a newer verified release, change `ref` and `sha` and push the `stable` branch.

## Rollback

There is no `plugin rollback` command. Roll back by switching channel (run in the project):

```sh
# 1. remove the plugin and its auto-installed dependencies from the latest channel
claude plugin uninstall sdd-engineering@dev-digest-ai-marketplace --scope project
claude plugin prune --scope project

# 2. add the stable marketplace and install the pinned release from it
claude plugin marketplace add BalakaMd/dev-digest-ai-marketplace#stable --scope project
claude plugin install sdd-engineering@dev-digest-ai-marketplace-stable --scope project

# 3. confirm the active version, then reload
claude plugin list --json        # sdd-engineering@dev-digest-ai-marketplace-stable -> 1.0.0, enabled
```

Then run `/reload-plugins` (or start a new session) and the smoke eval. Return to `latest` only after
the command sequence is recorded and plugin data is confirmed intact.

If the plugin could change external state, document how to restore it in the plugin README.

## Rollback rehearsal (2026-10-15)

Rehearsed from `sdd-engineering` 1.1.0 (`latest`) back to 1.0.0 (`stable`) in a clean project.

| Step | Result |
|------|--------|
| Install from `latest` | `sdd-engineering` 1.1.0 plus three dependencies at 1.0.0, no errors |
| Uninstall from `latest` | plugin removed; the CLI reports the three auto-installed dependencies as no longer needed |
| Add `dev-digest-ai-marketplace#stable` | marketplace added; project settings gain `extraKnownMarketplaces` with `ref: stable` |
| Install from `stable` | `sdd-engineering` 1.0.0 plus three dependencies at `1.0.0-adbbfe66c1d4` (the pinned commit), enabled, no errors |
| Smoke eval on tag `sdd-engineering--v1.0.0` | 4 of 4 cases score 1.0 (cost 0.58 USD) |

Things learned:

- Installs are recorded per project path. Copying a project folder does not copy the install, so the
  rehearsal must run in the real project or in a clean folder.
- Leave the old marketplace's plugins uninstalled, not merely disabled: the same plugin name from two
  marketplaces is a source of confusion in `claude plugin list`.
- Dependencies pinned in `stable` show the commit as a version suffix (`1.0.0-adbbfe66c1d4`); the
  plugin itself shows `1.0.0`.
