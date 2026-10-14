# Dependency Graph

## Plugin level

Declared in each plugin's `.claude-plugin/plugin.json` under `dependencies`.

```mermaid
graph TD
  SDD["sdd-engineering@1.0.0"]
  AR["architecture-review@1.0.0"]
  RT["research-tools@1.0.0"]
  EPP["engineering-paved-path@1.0.0"]

  SDD -->|"^1.0.0"| EPP
  SDD -->|"^1.0.0"| RT
  SDD -->|"^1.0.0"| AR
  AR -->|"^1.0.0"| EPP
```

`engineering-paved-path` is shared once: Claude Code resolves it a single time for both
`sdd-engineering` and `architecture-review`. There are no cycles.

## Component level

Dependency components are referenced by plugin-scoped (namespaced) name.

```mermaid
graph LR
  subgraph sdd["sdd-engineering"]
    RP["skill: run-plan"]
    SC["agent: spec-creator"]
    IP["agent: implementation-planner"]
    IM["agent: implementer"]
    PV["agent: plan-verifier"]
    WR["skill: workflow-retro"]
    EI["skill: engineering-insights"]
  end
  subgraph rt["research-tools"]
    RS["agent: researcher"]
  end
  subgraph ar["architecture-review"]
    ARV["agent: architecture-reviewer"]
  end
  subgraph epp["engineering-paved-path"]
    SK["skills: react, testing, nextjs, fastify, drizzle, postgresql, zod, typescript, security, mermaid, architecture"]
  end

  RP --> SC --> IP --> IM
  RP -.->|"research-tools:researcher"| RS
  RP -->|"architecture-review:architecture-reviewer"| ARV
  RP --> PV
  RP -.->|"explicit request only"| WR
  IM -->|"engineering-paved-path:*"| SK
  IP -->|"engineering-paved-path:*"| SK
  ARV -->|"engineering-paved-path:architecture"| SK
```

## Workflow order

1. `spec-creator` writes the spec.
2. `implementation-planner` reads the spec and writes the plan (may delegate questions to `research-tools:researcher`).
3. `run-plan` hands each task to `implementer`.
4. Independent review gate, run in parallel: `architecture-review:architecture-reviewer` and `plan-verifier`.
5. `workflow-retro` runs only when explicitly requested.

## Namespaced references

| Component | Reference |
|-----------|-----------|
| Shared skill | `engineering-paved-path:react-best-practices` |
| Researcher | `research-tools:researcher` |
| Architecture reviewer | `architecture-review:architecture-reviewer` |
| Own component | `sdd-engineering:spec-creator` |

## Release order

`engineering-paved-path` → `research-tools` → `architecture-review` → `sdd-engineering`
(dependencies first, consumer last — see [RELEASES.md](RELEASES.md)).

## Verification

After a test install, `claude plugin list --json` must show no `dependency-unsatisfied`,
`range-conflict` or `no-matching-tag` entries.
