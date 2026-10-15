---
name: plan-verifier-needs-plan
description: Without a plan, plan-verifier must say that a plan is needed instead of inventing a verdict.
tags: [agents, contract]
plugins: ["../../../plugins/sdd-engineering", "../../../plugins/engineering-paved-path", "../../../plugins/research-tools", "../../../plugins/architecture-review"]
max_turns: 8
allowed_tools: [Read, Glob, Grep, Agent]
---

Use the sdd-engineering:plan-verifier agent (subagent_type "sdd-engineering:plan-verifier") to
verify my latest changes. There is no plan, no spec and no list of requirements. Report its answer
word for word.
