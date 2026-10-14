# Plugin Guidelines

Design rules for deciding what belongs in a plugin. Mechanics (file layout, manifest fields,
PR checklist) are in [CONTRIBUTING.md](../CONTRIBUTING.md).

## What is reusable

| Group | Goes into a plugin? |
|-------|--------------------|
| Skills, agents, hooks, evals without project-specific paths | Yes |
| Project guidance (`CLAUDE.md`), product specs, module names | No — stays in the project |
| Integrations with network access or credentials (MCP) | Only as optional, documented |
| Caches, personal memory, experiments, absolute paths | Never |

## Boundaries

- One plugin = one owner, one consumer scenario, one release cadence.
- Shared skills have a single source (`engineering-paved-path`); agents reference them by namespaced name.
- Do not add skills "just in case" — every skill adds discovery context and support burden.
- Inputs are explicit: an agent states which files it reads and where it writes; it does not assume a repository layout.

## Agents

- Declare minimal `tools`; read-only agents get no write tools.
- Say what the agent does when an expected input (for example a test command) is missing.
- Keep detail in skill references loaded on demand, not duplicated in agent prompts.
