# Extraction Inventory

Where each component of the source project goes. Four groups:

1. **Reusable** — skills, agents, hooks, evals with no product-specific paths. Ship in a plugin.
2. **Project-specific** — guidance files, product specs, module names. Stay in the source project.
3. **Optional integrations** — network access or credentials (MCP). Not shipped in 1.0.0.
4. **Local leftovers** — caches, personal memory, experiments, absolute paths. Never shipped.

Owner of every plugin component: AI Engineering (`CODEOWNERS`).

## Group 1 — Reusable

### `sdd-engineering@1.0.0` (workflow)

| Source | Target | Consumer scenario | Why it ships with the plugin | Edit needed |
|--------|--------|-------------------|------------------------------|-------------|
| `agents/spec-creator.md` | `agents/spec-creator.md` | User asks for a spec of a small feature | First stage of the workflow; same release cadence as the planner it feeds | Spec location becomes a documented input (default `specs/<slug>/`); hook paths stay project-root relative |
| `agents/implementation-planner.md` | `agents/implementation-planner.md` | Spec exists, user wants a plan | Reads the spec the previous stage wrote; contract between them must change together | Document plan location (`specs/<slug>/plan.md`, fallback `.claude/plans/`); skill references become namespaced |
| `agents/implementer.md` | `agents/implementer.md` | Approved plan exists | Executes plan format defined by the planner | Test command discovery with explicit "not found" behavior; no module names |
| `agents/plan-verifier.md` | `agents/plan-verifier.md` | After implementation | Verifies against spec AC-n and plan; format coupled to both | Same plan/spec locations as above |
| `skills/dev-flow` (generalized, shipped as **`run-plan`**) | `skills/run-plan/` | User runs the whole chain | Orchestrates the four agents above and the review gate | Rename; drop `inbox/` convention or make it an explicit optional input; call dependencies by namespaced name; `save_chat_images.py` → `${CLAUDE_SKILL_DIR}` or drop |
| `skills/workflow-retro` | `skills/workflow-retro/` | Explicit request after a run | Reads run journals; script is part of the skill | `analyze_journals.py` via `${CLAUDE_SKILL_DIR}`; replace the one `server/docs/...` example |
| `skills/engineering-insights` | `skills/engineering-insights/` | Start/end of non-trivial work | Insight-log rubric used by implementer | **Generalize**: the module table is hardcoded to the source project; read module layout from repository docs |
| `evals/` (new) | `evals/` | CI and release gate | Behavior evals for the fixed scenario | Written during the lab; source evals are tied to the source project |

### `research-tools@1.0.0`

| Source | Target | Notes |
|--------|--------|-------|
| `agents/researcher.md` | `agents/researcher.md` | Already generic (0 project references). Tools: Read, Grep, Glob, Bash, WebSearch, WebFetch — keep read-only |

### `architecture-review@1.0.0` (depends on `engineering-paved-path`)

| Source | Target | Notes |
|--------|--------|-------|
| `agents/architecture-reviewer.md` | `agents/architecture-reviewer.md` | Already reads rules from repository guidance and architecture skills; verify no `reviewer-core`/`server/` leftovers. Tools: Read, Grep, Glob, Bash, Skill |
| `evals/agents/architecture-reviewer` | `evals/` | Cases and fixtures must be checked for project-specific paths before moving |

### `engineering-paved-path@1.0.0` (shared skills, single source)

Ship only skills a plugin actually uses or another consumer needs:

| Skill | Used by | Notes |
|-------|---------|-------|
| `react-best-practices`, `react-testing-library`, `next-best-practices` | implementer, architecture-reviewer | vendored upstream |
| `fastify-best-practices`, `drizzle-orm-patterns`, `postgresql-table-design`, `zod`, `typescript-expert` | implementer | vendored upstream |
| `security`, `mermaid-diagram` | implementer, planner (diagrams) | vendored upstream |
| `onion-architecture`, `frontend-ui-architecture` → generalized `architecture` skills | architecture-reviewer | Currently written for the source project; must be generalized in Step 4 |

## Group 2 — Project-specific (stay in the source project)

- `CLAUDE.md`, `AGENTS.md`, `INSIGHTS.md` files, `specs/**`, `docs/**`, `inbox/`
- `skills/pr-self-review` and `hooks/pr-self-review-gate.sh` (wired in `settings.json`, routes to project skills)
- `skills/dependency-checker` (names the project's packages)
- `agents/doc-writer.md`, `agents/test-writer.md`, `agents/architecture-reviewer-lite.md` — not part of the first release (lite is an eval A/B variant)
- `skills/spec` (`/spec` command wrapper) — left out; the `spec-creator` agent is the shipped surface
- `skills/ui-ux-pro-max` — 31 files, no consumer in the SDD workflow; excluded to keep discovery context small

## Group 3 — Optional integrations

- The project's MCP server (`mcp/`) and `.mcp.json` — network access to a local API; not shipped.

## Group 4 — Local leftovers (never shipped)

- `.claude/worktrees/`, `.claude/plans/`, `.claude/settings.json` (local wiring)
- `evals/results/`, `evals/proxy/`, `evals/node_modules/`
- Personal memory and experiment snapshots
- Any absolute path (`/Users/...`)

## Decisions to confirm

1. `run-plan` does not exist in the source project; it is the generalized `dev-flow`.
2. `engineering-insights` and the two architecture skills require real rewriting, not a copy.
3. Behavior evals for `sdd-engineering` are authored new.
