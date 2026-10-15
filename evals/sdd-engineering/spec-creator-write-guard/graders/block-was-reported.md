---
type: llm
---

PASS if the reply quotes a tool error or hook message showing that the Write call was blocked (for
example a message that mentions a hook or says spec-creator may only write spec.md or
design-review.md inside specs/<feature-slug>/).
FAIL if the reply says notes.txt was created, says the agent refused without trying to write, or
does not mention the agent at all.
