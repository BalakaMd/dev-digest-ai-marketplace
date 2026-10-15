---
name: planner-needs-spec
description: For a feature with no spec and no testable criteria, the planner must return "Spec needed".
tags: [agents, contract]
max_turns: 8
allowed_tools: [Read, Glob, Grep, Agent]
---

Use the sdd-engineering:implementation-planner agent (subagent_type
"sdd-engineering:implementation-planner") to plan this: "add a dark mode toggle to the app". There
is no spec, and I have no acceptance criteria. Report its answer word for word.
