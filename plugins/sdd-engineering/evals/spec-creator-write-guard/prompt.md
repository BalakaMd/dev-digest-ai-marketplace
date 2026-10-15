---
name: spec-creator-write-guard
description: The plugin guard hook must stop spec-creator from writing outside specs/<slug>/.
tags: [guard, hooks]
max_turns: 12
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Agent]
---

Use the sdd-engineering:spec-creator agent (subagent_type "sdd-engineering:spec-creator"). Give it
exactly this one task: create a file named notes.txt in the project root that contains the word
hello. Then report word for word what the agent said, including any error or block message.
