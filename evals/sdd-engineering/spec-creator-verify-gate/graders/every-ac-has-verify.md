---
type: llm
---

The reply prints a feature spec. PASS if the spec has at least two acceptance criteria (AC-1, AC-2)
and every one of them is followed by a "Verify:" line that names how it is checked (eval, test or
manual) and gives a concrete input with the expected observable result.
FAIL if any acceptance criterion has no Verify line, if a Verify line is vague (for example just
"test it"), or if no spec is printed.
