---
name: plan-template
description: Section layout of a Development Plan file, loaded by the implementation-planner when it writes the plan
user-invocable: false
---

# Development plan template

Use these sections exactly, in this order. Omit only what the template marks as omittable.

```
# Development Plan: <title>

Created: <YYYY-MM-DD> · Branch: <branch> · HEAD: <short commit hash> · Status: ready | blocked
Spec: <path> · <SPEC-NN> · <spec status>   (omit the line when the task has no spec)
Recommended mode: single-agent | multi-agent — <one-line reason>

## Requirements
- [AC-n | NFR-n:] "<requirement, verbatim from the spec or task>" → S<n>[, S<m>] [· assumes Q-n] [· deviates: <how and why>] [· pending R-n]

## Traceability
| Requirement | Steps | Tests | Verify (command) | Verification hint | State |
|-------------|-------|-------|------------------|-------------------|-------|
| AC-1 | S1, S3 | T-1, T-2 | `<command>` | <hands-on path / request / measurement> | planned \| assumes Q-n \| deviates \| pending R-n |

## Non-functional requirements
| NFR / quality | Source (spec id or guidance) | Mechanism (step) | Verification |
|---------------|------------------------------|------------------|--------------|

## Requirements review
- R-n [blocking] <requirement id> — <check failed> — <evidence, path:line> — <what the spec author must decide>
- Q-n [non-blocking] <requirement id> — <the readings> — planned with: <recommended option>
- Requirements suggestions for the spec author: <behaviour changes worth considering | none>
(or "No findings.")

## Scope
In: <...>
Out: <...>

## Context used
- Guidance read: <files>
- Lessons applied: <log § entry> → <how the plan respects it> (logs of touched folders only)
- Research used: <report question → conclusion, source> (omit when none)
- Designs: `<path>` — <screen / state shown> → steps <S2, S4> (omit when none; cite a spec's `designs/` copy when one exists)
- Skills: <skill> — <why> — steps <S1, S3>

## Architecture constraints
| Rule | Source | How the plan complies |
|------|--------|-----------------------|

## Steps
### S1 <title>
- Module / layer: <...>
- Files: create | modify `<path>` — <what changes>
- Designs: `<path>` — <screen / state this step implements>   (UI steps when designs were passed; omit otherwise)
- Skills to apply: <skill> § <section>
- Depends on: <step ids or —>
- Tests (single-agent mode): <T-n, … | —>
- Done when: <observable condition>
- Verify: `<exact command from the project guidance>`

### I1 <optional improvement — title>   (one per I-n; recommended | optional)
- <same fields as a step>

## Execution modes
Single-agent: one implementer runs S1 → S<n> in order, writing T-n inside its steps.
Multi-agent:
| Wave | Instance | Steps | Owned files / area |
|------|----------|-------|--------------------|
| 1 | implementer #1 | S1, S2 | <...> |
| 2 | test-writer | T-1 … T-n | <area> |
Recommended: <mode> — <reason>

## Cross-module contracts & sync points
- <contract> — <every place that must change together>

## Test plan
- Existing suites to run: `<command>` — <why>
- T-n <behaviour or requirement id> — <level> — <file, per the naming convention> — single: S<n> · multi: test-writer
- Not tested: <behaviour> — <reason> (omit when empty)

## Risks & open questions
- [blocking] <question> — <why it blocks> — suggested default: <default>
- [non-blocking] <...>

## Self-check
1 pass · 2 pass · 3 fixed: <what> · … · 10 pass

## Out of scope for the implementer
Architecture and security review are done by separate agents. Requirements are fixed by the
spec or task; a needed change goes back to the user, not into the code.
```
