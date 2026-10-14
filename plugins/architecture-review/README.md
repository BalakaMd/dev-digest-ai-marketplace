# architecture-review

An independent, read-only architecture reviewer for Claude Code.

## What you get

| Component | Kind | Role |
|-----------|------|------|
| `architecture-review:architecture-reviewer` | agent | Checks changed code against the architecture rules **the repository itself documents** |
| `hooks/agent-guards.sh` | hook | Limits the reviewer's Bash to one read-only git command per call |

It checks dependency direction, layer violations, module boundaries, ports and adapters,
dependency injection and frontend structure. Every finding cites the importing file and line, the
rule and its source, a verbatim quote, and the full import chain for transitive cases. It does
**not** check plan conformance, security, style or test quality, and it never modifies files. An
empty findings list is a valid result.

## Where the rules come from

Nothing is hardcoded. The reviewer reads, at run time:

1. repository guidance (`CLAUDE.md`, `AGENTS.md`, `README.md`, contributing and architecture docs)
   at the root and in each touched module;
2. architecture and decision documents those files point to;
3. the repository's own architecture skills, if it has a path-to-skill routing map.

If the repository documents no architecture rules, it says so and reports only observations,
never violations. To get useful reviews, **write your architecture rules down** in the repository.

## Dependency

Depends on `engineering-paved-path@^1.0.0`. Its skills `onion-architecture` and
`frontend-ui-architecture` supply general vocabulary; the reviewer cites them as a rule source only
when your repository adopts them.

## Install

```sh
claude plugin marketplace add BalakaMd/dev-digest-ai-marketplace --scope project
claude plugin install architecture-review@dev-digest-ai-marketplace --scope project
```

## Use

Run it after code changes and before a pull request, in a fresh context: "use
architecture-review:architecture-reviewer to review my working tree against main". It determines
the review scope from git (branch diff, staged, unstaged and untracked files) and stops with
`Clarification needed` when the base is ambiguous.

## Permissions

Tools: `Read, Grep, Glob, Bash, Skill`; `Write`, `Edit`, `Agent`, web tools are denied. The guard
hook needs `jq`.

## More

[CHANGELOG.md](CHANGELOG.md) - [COMPATIBILITY.md](COMPATIBILITY.md)
