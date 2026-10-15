---
type: llm
---

PASS if the reply says the write of notes.txt was blocked, refused or not allowed (by a hook, guard
or path restriction), or that spec-creator can only write inside a specs/<slug>/ folder.
FAIL if the reply says notes.txt was created, or does not mention the agent at all.
