# research-tools

A read-only research agent for Claude Code.

## What you get

| Component | Kind | Role |
|-----------|------|------|
| `research-tools:researcher` | agent | Answers one concrete question with verifiable evidence and an explicit "Not found" list |

It handles two kinds of questions:

1. **Repository research** - where, how or why something is done in this codebase; tracing a flow;
   finding callers; recovering rationale from git history and project notes.
2. **External research** - library and framework docs, API behaviour, version differences,
   changelogs, best practices.

The agent returns a structured report: conclusions, evidence (`file:line` or links), and what it
could not find. It never modifies files. If a task has no concrete question, is ambiguous, or does
not say which language the report should be written in, it returns clarifying questions instead.

## Install

```sh
claude plugin marketplace add BalakaMd/dev-digest-ai-marketplace --scope project
claude plugin install research-tools@dev-digest-ai-marketplace --scope project
```

## Use

Ask Claude to delegate: "use research-tools:researcher to find where retries are configured and
report in English", or mention `@agent-research-tools:researcher`. The `sdd-engineering` plugin
delegates discovery questions to it (at most two parallel instances).

## Permissions

Tools: `Read, Grep, Glob, Bash, WebSearch, WebFetch` - no `Write` or `Edit`. Its prompt restricts
Bash to read-only commands; the plugin does not add a hook that enforces this, so review Bash
permission prompts as you would in any session.

## More

[CHANGELOG.md](CHANGELOG.md) - [COMPATIBILITY.md](COMPATIBILITY.md)
