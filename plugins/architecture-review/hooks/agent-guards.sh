#!/usr/bin/env bash
# PreToolUse guard for the architecture-reviewer agent.
#
# Agents shipped in a plugin cannot declare hooks in their own frontmatter, so the Bash limit
# lives here. The hook fires for every Bash call but acts only when the call comes from
# architecture-reviewer (hook input field "agent_type"). The reviewer may run exactly one
# read-only git command per call. Exit 2 blocks the call and returns stderr to the agent.
#
# Requires jq when the reviewer runs.

input=$(cat)

agent=$(printf '%s' "$input" | grep -oE '"agent_type"[[:space:]]*:[[:space:]]*"[^"]*"' | head -n 1 | sed -E 's/^.*:[[:space:]]*"(.*)"$/\1/')
agent=${agent##*:} # drop the "<plugin>:" prefix of a namespaced agent name
[ "$agent" = architecture-reviewer ] || exit 0

deny() { echo "architecture-reviewer: Bash denied: $1. Only one read-only git command per call; no pipes, redirections, chaining or variables. Use Read, Grep and Glob, or git grep and git ls-files, to read and search files." >&2; exit 2; }

command -v jq >/dev/null 2>&1 || deny "jq is not installed"
c=$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null) || deny "hook payload is not valid JSON"
[ -n "$c" ] || deny "no command in the hook payload"
case $c in *[';&|<>$`\']*) deny "shell metacharacter" ;; esac
case $c in *'
'*) deny "multi-line command" ;; esac
set -f; set -- $c
[ "${1-}" = git ] || deny "only git may run"; shift
while :; do case ${1-} in -C) [ $# -ge 2 ] || deny "-C needs a directory"; shift 2 ;; --no-pager) shift ;; *) break ;; esac; done
case ${1-} in status|diff|log|show|ls-files|merge-base|rev-parse|grep) ;; *) deny "git subcommand '${1-}' is not allowed" ;; esac
for w; do case $(printf '%s' "$w" | tr -d "\"'") in --out*|--ext*|--op*|-O*) deny "option $w can write files or run programs" ;; esac; done
exit 0
