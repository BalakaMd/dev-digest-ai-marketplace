# Evals for sdd-engineering

Behaviour checks run with `claude plugin eval`. They make real model calls as the user who runs
them, so run them on purpose and watch the cost.

| Case | What it proves |
|------|----------------|
| `unrelated-prompt-no-activation` | An unrelated question activates no workflow skill or agent (negative case) |
| `spec-creator-write-guard` | The plugin guard hook blocks `spec-creator` from writing outside `specs/<slug>/` |
| `plan-verifier-needs-plan` | With no plan, `plan-verifier` answers `Plan needed` and gives no verdict |
| `planner-needs-spec` | With no spec or criteria, `implementation-planner` answers `Spec needed` |

## Run

```sh
# from the repository root; the dependency plugins are loaded from disk
claude plugin eval plugins/sdd-engineering --ablation none --runs 2 --allow-tools Write Edit
```

- `--ablation none` skips the no-plugin arm. Without the plugin the agents do not exist, so those
  runs fail with `Agent type ... not found`; that is expected and says nothing about quality.
- `--allow-tools Write Edit` is needed by `spec-creator-write-guard`, whose point is that the write is
  refused by the hook and not by a missing tool.
- Results go to `evals/results/`, which is git-ignored.
