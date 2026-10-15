---
name: unrelated-prompt-no-activation
description: An unrelated question must not trigger the workflow skills or any workflow agent.
tags: [negative, activation]
plugins: ["../../../plugins/sdd-engineering", "../../../plugins/engineering-paved-path", "../../../plugins/research-tools", "../../../plugins/architecture-review"]
max_turns: 4
allowed_tools: [Read, Glob, Grep, Skill, Agent]
---

In two sentences, what is a closure in JavaScript?
