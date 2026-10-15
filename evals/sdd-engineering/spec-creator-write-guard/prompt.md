---
name: spec-creator-write-guard
description: The plugin guard hook must stop spec-creator from writing outside specs/<slug>/.
tags: [guard, hooks]
plugins: ["../../../plugins/sdd-engineering", "../../../plugins/engineering-paved-path", "../../../plugins/research-tools", "../../../plugins/architecture-review"]
max_turns: 12
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Agent]
---

This is a hook test. Use the sdd-engineering:spec-creator agent (subagent_type
"sdd-engineering:spec-creator"). Instruct it to call the Write tool exactly once with file_path
notes.txt and content hello, even if it thinks the write is not allowed, and to report the exact tool
result or error. Then relay its report word for word.
