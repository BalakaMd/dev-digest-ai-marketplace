# sdd-engineering

A spec-driven development workflow for Claude Code: turn a task into a spec, a plan, working
code and an independent review - with a human decision at each checkpoint.

## What you get

| Component | Kind | Role |
|-----------|------|------|
| `sdd-engineering:run-plan` | skill (explicit only) | Orchestrates the whole pipeline |
| `sdd-engineering:spec-creator` | agent | Writes a feature spec with EARS acceptance criteria (`AC-n`) and a design review |
| `sdd-engineering:implementation-planner` | agent | Reads the spec and writes a plan with a traceability matrix and test plan |
| `sdd-engineering:implementer` | agent | Executes plan steps, runs the repository's own checks, never touches git history |
| `sdd-engineering:plan-verifier` | agent | Read-only: checks the finished code against every `AC-n`, `NFR-n` and plan item |
| `sdd-engineering:workflow-retro` | skill (explicit only) | Post-mortem of a multi-agent run: cost, struggles, recommendations |
| `sdd-engineering:engineering-insights` | skill | Reads and maintains per-module `INSIGHTS.md` logs |

Dependencies (installed automatically):

- `engineering-paved-path` - shared technical skills the agents load by namespaced name
- `research-tools` - the read-only `researcher` agent
- `architecture-review` - the independent `architecture-reviewer`

## Install

```sh
claude plugin marketplace add BalakaMd/dev-digest-ai-marketplace --scope project
claude plugin install sdd-engineering@dev-digest-ai-marketplace --scope project
```

Start a new session or run `/reload-plugins`. Requires Claude Code `>=2.1.110` and `jq` (see
[COMPATIBILITY.md](COMPATIBILITY.md)).

## How the pieces work together

```
/sdd-engineering:run-plan "<task or spec path>"
   1. spec-creator           -> specs/<slug>/spec.md (+ design-review.md)      you approve
   2. researcher (optional)  -> compact findings with file:line / links
   3. implementation-planner -> specs/<slug>/plan.md                           you approve (Checkpoint A)
   4. implementer            -> code in the working tree, nothing committed
   5. review gate, in parallel:
        architecture-reviewer  (rules the repository documents itself)
        plan-verifier          (every AC-n against the code)                    you decide (Checkpoint B)
   6. final report           -> you decide whether to commit
```

`workflow-retro` runs only when you ask for it, after a run:
`/sdd-engineering:workflow-retro`.

## Where files are written

| Artifact | Path (relative to the project root) |
|----------|-------------------------------------|
| Feature spec | `specs/<feature-slug>/spec.md` |
| Design review | `specs/<feature-slug>/design-review.md` |
| Plan for a spec | `specs/<feature-slug>/plan.md` |
| Plan without a spec | `.claude/plans/<date>-<slug>.md` |
| Retro ledger | `docs/retros/ledger.md` |

A plugin hook (`hooks/agent-guards.sh`) blocks these agents from writing anywhere else.
`implementer` also cannot run history-changing git commands, and `plan-verifier` can run only one
read-only git command per call.

## Behaviour you can rely on

- **No test command found?** The implementer looks in the repository guidance, package manifests,
  Makefile and CI workflows; if it finds nothing it reports `not run: no command found` and lists
  where it looked - it never invents a command.
- **Missing dependency plugin?** `run-plan` names the plugin that is not installed and offers only
  the stages that can run.
- **Project instructions win.** The plugin adds no `CLAUDE.md`; agents read yours at run time.
- **Irrelevant request?** `run-plan` and `workflow-retro` are explicit-only and do not activate on
  unrelated prompts.

## Writing project-specific rules

The agents learn conventions from the repository, not from this plugin. Put your layout, commands,
do-not-touch zones and architecture rules in `CLAUDE.md` / `AGENTS.md` and in architecture docs;
`architecture-review:architecture-reviewer` reads those.

## More

- [CHANGELOG.md](CHANGELOG.md) - release history
- [COMPATIBILITY.md](COMPATIBILITY.md) - minimum Claude Code version, requirements, known limits
- Marketplace docs: `docs/RELEASES.md` (update and rollback), `docs/DEPENDENCY-GRAPH.md`
