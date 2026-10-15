# Cost Baseline

One measured baseline for `sdd-engineering`, one optimization, and the quality gate that decided
whether to keep it. Numbers are from real runs; where a difference is inside the noise, this
document says so.

## Setup

| Item | Value |
|------|-------|
| Plugin | `sdd-engineering` 1.0.0 with its three dependencies |
| Baseline commit | `adbbfe6` (tag `sdd-engineering--v1.0.0`) |
| Optimized commit | `a1a8b1a` on branch `step-8-cost-baseline` (adds the `plan-template` skill) |
| Claude Code | 2.1.289 |
| Models | as configured in the agents (`spec-creator` opus, `implementation-planner` sonnet, others per agent file); the same for both runs |
| Suite | `evals/sdd-engineering/` (4 cases), one run per case |
| Command | `claude plugin eval . --ablation none --runs 1 --allow-tools Write Edit --trust-plugin --max-cost-usd 3 --no-publish --json` |

Static cost comes from `claude plugin details sdd-engineering` (no model call). Dynamic cost comes
from the eval report (`costUsd` includes the judge calls for `llm` graders).

## Baseline

Static (all four plugins loaded):

| Component | Always-on tokens | On-invoke tokens |
|-----------|------------------|------------------|
| Plugin total | ~2,081 | n/a |
| `implementation-planner` | ~490 | ~8k |
| `spec-creator` | ~300 | ~4.8k |
| `plan-verifier` | ~300 | ~2.9k |
| `implementer` | ~260 | ~2.6k |

Dynamic (eval suite, one run per case):

| Case | Passed | Turns | Cost USD | Duration |
|------|--------|-------|----------|----------|
| `unrelated-prompt-no-activation` | yes | 1 | 0.0733 | 4 s |
| `planner-needs-spec` | yes | 2 | 0.1352 | 9 s |
| `spec-creator-write-guard` | yes | 2 | 0.1768 | 19 s |
| `plan-verifier-needs-plan` | yes | 2 | 0.1804 | 15 s |
| **Suite** | **4 / 4** | | **0.5657** | **48 s** |

Cost per passed case: 0.5657 / 4 = **0.141 USD**. The eval report does not expose token counts, only
cost, turns and duration, so tokens are reported only for the static view.

## Optimization

**Idea.** `implementation-planner` carried the full plan-file template (about 3.6 KB) in its
instructions, although it is needed only at Step 9, after intake, research and review. An invocation
that exits early (`Spec needed`, a blocked plan) never uses it.

**Change.** The template moved into a skill, `sdd-engineering:plan-template`
(`user-invocable: false`). The agent now loads it with the Skill tool right before it writes the
plan. The agent file shrank from 24,771 to 21,479 bytes.

**Failed first attempt.** The template was first a plain file under `references/`, read by the agent
through `${CLAUDE_PLUGIN_ROOT}`. The variable resolves, but `Read` on a path outside the project
needs a permission the subagent did not have in a normal project, so the planner reported it could
not read its template. A check that happened to run from inside the plugin repository hid this.
It failed the quality gate and was replaced by the skill approach, which needs no file permission.

## After

Static:

| Component | Before | After |
|-----------|--------|-------|
| Plugin always-on | ~2,081 | ~2,125 (+44, the new skill's description) |
| `implementation-planner` on-invoke | ~8k | ~6.9k |
| `plan-template` on-invoke | n/a | ~1.2k (paid only when the plan is written) |

Dynamic (same suite, same settings):

| Case | Passed | Cost USD before | Cost USD after |
|------|--------|-----------------|----------------|
| `unrelated-prompt-no-activation` | yes | 0.0733 | 0.0736 |
| `planner-needs-spec` (the changed agent) | yes | 0.1352 | 0.1258 |
| `spec-creator-write-guard` | yes | 0.1768 | 0.1345 |
| `plan-verifier-needs-plan` | yes | 0.1804 | 0.1223 |
| **Suite** | **4 / 4** | **0.5657** | **0.4563** |

Cost per passed case: **0.114 USD** (before 0.141).

## Quality gate

An optimization is kept only if all of these hold:

1. The eval suite stays at 4 / 4 (score 1.0 on every case). **Met.**
2. The changed agent still produces a plan with every section of the template. Check: a planner run
   on a small approved spec, in a project outside the plugin repository, wrote
   `specs/<slug>/plan.md` with all 14 sections in template order. **Met** (one run).
3. No new permission requirement. **Met** with the skill approach; the file approach failed here.

## Reading the result honestly

- The suite got 19% cheaper (0.5657 to 0.4563 USD), but most of that is not from the change. The
  two cases whose agents were not touched (`plan-verifier-needs-plan`, `spec-creator-write-guard`)
  became 32% and 24% cheaper by themselves, so run-to-run variation with one run per case is at
  least that large. The only case that exercises the changed agent moved by 7% (0.1352 to 0.1258),
  which is **inside the noise**. No saving is claimed from the dynamic numbers.
- The static numbers are exact but modest: the planner is about 1.1k tokens lighter on invocations
  that never reach Step 9. On a run that does write a plan, the template is loaded anyway (~1.2k),
  so a full run is roughly neutral and pays about 40 always-on tokens plus one Skill call.
- The suite measures early exits and guards, not a full spec to plan to implementation workflow, so
  this document does not claim a cost per complete workflow. That needs an end-to-end run measured
  with the `workflow-retro` skill.

## How to reproduce

```sh
git checkout adbbfe6                 # baseline
claude plugin eval . --ablation none --runs 1 --allow-tools Write Edit --trust-plugin \
  --max-cost-usd 3 --no-publish --json > baseline.json
git checkout step-8-cost-baseline    # optimized
claude plugin eval . --ablation none --runs 1 --allow-tools Write Edit --trust-plugin \
  --max-cost-usd 3 --no-publish --json > after.json
```

Use `--runs 3` or more before drawing conclusions from small differences.
