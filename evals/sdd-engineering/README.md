# Evals for sdd-engineering

The suite lives at the repository root, not inside the plugin, because `claude plugin eval` only lets a
case load plugin directories below the directory it is run against, and these cases need all four.

Behaviour checks run with `claude plugin eval`. They make real model calls as the user who runs
them, so run them on purpose and watch the cost.

| Case | What it proves |
|------|----------------|
| `unrelated-prompt-no-activation` | An unrelated question activates no workflow skill or agent (negative case) |
| `spec-creator-write-guard` | The plugin guard hook blocks `spec-creator` from writing outside `specs/<slug>/` |
| `spec-creator-verify-gate` | Since 1.1.0, every acceptance criterion in a written spec has a `Verify:` line (fails on 1.0.0) |
| `plan-verifier-needs-plan` | With no plan, `plan-verifier` answers `Plan needed` and gives no verdict |
| `planner-needs-spec` | With no spec or criteria, `implementation-planner` answers `Spec needed` |

## Dependencies

`sdd-engineering` declares dependencies on the other three plugins, and a plugin loaded alone from a
directory fails with `dependency-unsatisfied` (its agents then do not exist at all). Every case
therefore lists all four plugin directories in its `plugins:` frontmatter field, so they load together.

## Run

```sh
# from the repository root; the dependency plugins are loaded from disk
claude plugin eval . --ablation none --runs 2 --allow-tools Write Edit --trust-plugin
```

- `--ablation none` skips the no-plugin arm. Without the plugin the agents do not exist, so those
  runs fail with `Agent type ... not found`; that is expected and says nothing about quality.
- `--allow-tools Write Edit` is needed by `spec-creator-write-guard` and `spec-creator-verify-gate`, whose point is that the write is
  refused by the hook and not by a missing tool.
- Results go to `evals/results/`, which is git-ignored.
- To run one case: add `--case spec-creator-write-guard`.
