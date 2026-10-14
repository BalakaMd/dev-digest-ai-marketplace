#!/usr/bin/env bash
# PreToolUse guard for the sdd-engineering agents.
#
# Agents shipped in a plugin cannot declare hooks in their own frontmatter, so the write
# limits live here. The hook fires for every Write, Edit and Bash call but acts only when
# the call comes from one of this plugin's agents (hook input field "agent_type").
# Exit 2 blocks the call and returns stderr to the agent; exit 0 allows it.
#
# Requires jq for guarded agents. Paths are relative to $CLAUDE_PROJECT_DIR:
#   specs/<feature-slug>/spec.md | design-review.md | plan.md    and    .claude/plans/<name>.md

input=$(cat)

agent=$(printf '%s' "$input" | grep -oE '"agent_type"[[:space:]]*:[[:space:]]*"[^"]*"' | head -n 1 | sed -E 's/^.*:[[:space:]]*"(.*)"$/\1/')
agent=${agent##*:} # drop the "<plugin>:" prefix of a namespaced agent name

case "$agent" in
  spec-creator|implementation-planner|implementer|plan-verifier) ;;
  *) exit 0 ;;
esac

deny() { echo "$agent: $1" >&2; exit 2; }

command -v jq >/dev/null 2>&1 || deny "jq is not installed; the sdd-engineering guard hook needs it"
tool=$(printf '%s' "$input" | jq -r '.tool_name // empty') || deny "hook payload is not valid JSON"
root=${CLAUDE_PROJECT_DIR:-}
[ -n "$root" ] || deny "CLAUDE_PROJECT_DIR is not set"

file_path() {
  p=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
  [ -n "$p" ] || deny "no file_path in the tool input"
  case "$p" in *..*|*\\*) deny "path traversal is not allowed" ;; esac
}

case "$agent" in
  spec-creator)
    [ "$tool" = Write ] || [ "$tool" = Edit ] || exit 0
    file_path
    msg="may only write spec.md or design-review.md directly inside $root/specs/<feature-slug>/ (slug: lowercase letters, digits, hyphens); propose anything else in the report"
    r=${p#"$root"/specs/}
    [ "$r" != "$p" ] || deny "$msg"
    case "$r" in */*) : ;; *) deny "$msg" ;; esac
    s=${r%%/*}
    f=${r#*/}
    case "$f" in spec.md|design-review.md) : ;; *) deny "$msg" ;; esac
    case "$s" in ''|-*|*[!a-z0-9-]*) deny "$msg" ;; esac
    ;;

  implementation-planner)
    [ "$tool" = Write ] || exit 0
    file_path
    msg="may only write a plan: $root/.claude/plans/<name>.md or $root/specs/<feature-slug>/plan.md"
    case "$p" in
      "$root"/.claude/plans/*/*) deny "$msg" ;;
      "$root"/.claude/plans/*.md) exit 0 ;;
    esac
    r=${p#"$root"/specs/}
    [ "$r" != "$p" ] || deny "$msg"
    s=${r%%/*}
    [ "${r#*/}" = plan.md ] || deny "$msg"
    case "$s" in ''|-*|*[!a-z0-9-]*) deny "$msg" ;; esac
    ;;

  implementer)
    [ "$tool" = Bash ] || exit 0
    c=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')
    if printf '%s' "$c" | grep -qE '(^|[^[:alnum:]_-])git[[:space:]].*(commit|push|reset|rebase|checkout|switch|restore|clean|stash|merge|cherry-pick|revert|tag)([^[:alnum:]_-]|$)|(^|[^[:alnum:]_-])gh[[:space:]]+(pr|release|repo)([^[:alnum:]_-]|$)'; then
      deny "git operations that change history, branches or uncommitted work are not allowed; report instead"
    fi
    ;;

  plan-verifier)
    [ "$tool" = Bash ] || exit 0
    d() { deny "Bash denied: $1. Only one read-only git command per call; no pipes, redirections, chaining or variables. Use Read, Grep and Glob, or git grep and git ls-files, to read and search files."; }
    c=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')
    [ -n "$c" ] || d "no command in the hook payload"
    case $c in *[';&|<>$`\']*) d "shell metacharacter" ;; esac
    case $c in *'
'*) d "multi-line command" ;; esac
    set -f; set -- $c
    [ "${1-}" = git ] || d "only git may run"; shift
    while :; do case ${1-} in -C) [ $# -ge 2 ] || d "-C needs a directory"; shift 2 ;; --no-pager) shift ;; *) break ;; esac; done
    case ${1-} in status|diff|log|show|ls-files|merge-base|rev-parse|grep) ;; *) d "git subcommand '${1-}' is not allowed" ;; esac
    for w; do case $(printf '%s' "$w" | tr -d "\"'") in --out*|--ext*|--op*|-O*) d "option $w can write files or run programs" ;; esac; done
    ;;
esac
exit 0
