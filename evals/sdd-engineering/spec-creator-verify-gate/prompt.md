---
name: spec-creator-verify-gate
description: Since 1.1.0 spec-creator must give every acceptance criterion a Verify line (eval, test or manual) before it reports the spec complete.
tags: [spec-creator, completeness-gate, release-1.1.0]
plugins: ["../../../plugins/sdd-engineering", "../../../plugins/engineering-paved-path", "../../../plugins/research-tools", "../../../plugins/architecture-review"]
max_turns: 20
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Agent]
---

Use the sdd-engineering:spec-creator agent (subagent_type "sdd-engineering:spec-creator") to write a
draft spec for a tiny text-only task. Spec slug: slugify-trim. Task: the function slugify(text) must
return "hello-world" for the input "--Hello   World--", and must return "" for the empty string.
These two behaviours are the complete requirements; there are no designs, no other modules and no open
questions, so do not ask any. The agent must write specs/slugify-trim/spec.md.

When the agent finishes, use the Read tool on specs/slugify-trim/spec.md and print the file
content word for word, then print the agent's Result line.
