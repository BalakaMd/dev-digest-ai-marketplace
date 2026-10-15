---
name: plan-verifier-needs-plan
description: Without a plan, plan-verifier must say that a plan is needed instead of inventing a verdict.
tags: [agents, contract]
max_turns: 8
allowed_tools: [Read, Glob, Grep, Agent]
---

Use the sdd-engineering:plan-verifier agent (subagent_type "sdd-engineering:plan-verifier") to
verify my latest changes. There is no plan, no spec and no list of requirements. Report its answer
word for word.
