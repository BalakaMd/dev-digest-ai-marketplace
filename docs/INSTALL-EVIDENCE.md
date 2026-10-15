# Install evidence

Recorded outputs of `claude plugin list --json` for `sdd-engineering` and its three dependencies at
each stage of the release flow. Taken on 2026-10-15 with Claude Code 2.1.289, project scope, in a
project that does not contain any DevDigest files.

The command used for every listing:

```sh
claude plugin list --json | jq -c '.[] | select(.enabled) | {id, version, errors}'
```

`errors: null` on every line means each plugin and every dependency is installed and active with no
resolution errors.

## 1. Install 1.0.0 from the `stable` channel

`stable` pins every plugin to its `1.0.0` tag and commit `adbbfe6` (see `docs/RELEASES.md`).

```sh
claude plugin marketplace add BalakaMd/dev-digest-ai-marketplace#stable --scope project
claude plugin install sdd-engineering@dev-digest-ai-marketplace-stable --scope project
```

```
Successfully installed plugin: sdd-engineering@dev-digest-ai-marketplace-stable (scope: project) (+ 3 dependencies: engineering-paved-path, research-tools, architecture-review)
{"id":"architecture-review@dev-digest-ai-marketplace-stable","version":"1.0.0-adbbfe66c1d4","errors":null}
{"id":"engineering-paved-path@dev-digest-ai-marketplace-stable","version":"1.0.0-adbbfe66c1d4","errors":null}
{"id":"research-tools@dev-digest-ai-marketplace-stable","version":"1.0.0-adbbfe66c1d4","errors":null}
{"id":"sdd-engineering@dev-digest-ai-marketplace-stable","version":"1.0.0","errors":null}
```

## 2. Update to 1.1.0 on the `latest` channel

In a project where `sdd-engineering` 1.0.0 was installed from `latest` (before 1.1.0 was tagged),
the update looked like this:

```sh
claude plugin marketplace update dev-digest-ai-marketplace
claude plugin update sdd-engineering@dev-digest-ai-marketplace --scope project
```

```
Successfully updated marketplace: dev-digest-ai-marketplace
Plugin "sdd-engineering" updated from 1.0.0 to 1.1.0 for scope project
```

Active versions afterwards:

```
{"id":"architecture-review@dev-digest-ai-marketplace","version":"1.0.0","errors":null}
{"id":"engineering-paved-path@dev-digest-ai-marketplace","version":"1.0.0","errors":null}
{"id":"research-tools@dev-digest-ai-marketplace","version":"1.0.0","errors":null}
{"id":"sdd-engineering@dev-digest-ai-marketplace","version":"1.1.0","errors":null}
```

The dependencies stay at 1.0.0 because `sdd-engineering` declares them as `^1.0.0` and they were not
changed in this release. The project where this was done is
[BalakaMd/sdd-test-project](https://github.com/BalakaMd/sdd-test-project).

## 3. Roll back to 1.0.0 through `stable`

```sh
# remove the four plugins installed from latest
claude plugin uninstall sdd-engineering@dev-digest-ai-marketplace --scope project
claude plugin uninstall architecture-review@dev-digest-ai-marketplace --scope project
claude plugin uninstall engineering-paved-path@dev-digest-ai-marketplace --scope project
claude plugin uninstall research-tools@dev-digest-ai-marketplace --scope project

claude plugin install sdd-engineering@dev-digest-ai-marketplace-stable --scope project
```

```
{"id":"architecture-review@dev-digest-ai-marketplace-stable","version":"1.0.0-adbbfe66c1d4","errors":null}
{"id":"engineering-paved-path@dev-digest-ai-marketplace-stable","version":"1.0.0-adbbfe66c1d4","errors":null}
{"id":"research-tools@dev-digest-ai-marketplace-stable","version":"1.0.0-adbbfe66c1d4","errors":null}
{"id":"sdd-engineering@dev-digest-ai-marketplace-stable","version":"1.0.0","errors":null}
```

The smoke eval on the `1.0.0` tag scored 4 of 4 (see `docs/RELEASES.md`, "Rollback rehearsal").

## Notes

- `claude plugin list --json` reports installs recorded for every project path on the machine, not only
  the current directory. Uninstall scratch installs before taking a listing, otherwise entries repeat.
- The `1.0.0-adbbfe66c1d4` version on dependencies is how a plugin pinned by commit in `stable` is
  reported: the version plus the first 12 characters of the commit.
