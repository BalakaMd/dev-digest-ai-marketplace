# dev-digest-ai-marketplace-stable

The stable channel of `dev-digest-ai-marketplace`. Every plugin is pinned to a verified release tag
and commit, so this marketplace does not move when `main` does.

Currently pinned: all four plugins at 1.0.0 (commit `adbbfe6`).

```sh
claude plugin marketplace add BalakaMd/dev-digest-ai-marketplace#stable --scope project
claude plugin install sdd-engineering@dev-digest-ai-marketplace-stable --scope project
```

Use it to roll back: remove the plugin installed from the `latest` marketplace, install it from here,
then run the smoke eval. See `docs/RELEASES.md` on the `main` branch for the full sequence.
