# Changelog

All notable changes to this plugin are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[Semantic Versioning](https://semver.org/).

## [1.1.0] - 2026-10-15

### Added
- `spec-creator` completeness gate (Step 3b): a spec is reported `Ready for approval`, and may be set
  to `approved`, only when every goal, user story, edge case and non-functional requirement is covered
  by an acceptance criterion and every acceptance criterion has a `Verify:` line (eval, test or
  manual, with a concrete input and expected result). A failing gate keeps `Draft written` and lists
  `Completeness gaps:`.
- Eval case `spec-creator-verify-gate`: fails on 1.0.0 and passes on 1.1.0.

### Changed
- The `spec.md` template shows the `Verify:` line under each acceptance criterion.
- `implementation-planner` loads its plan template through the new internal skill
  `sdd-engineering:plan-template` instead of carrying it inline (see `docs/COST-BASELINE.md`).

## [1.0.0] - 2026-10-15

### Added
- Agents: `spec-creator`, `implementation-planner`, `implementer`, `plan-verifier`.
- Skills: `run-plan` (explicit only), `workflow-retro` (explicit only), `engineering-insights`.
- Plugin-level guard hook (`hooks/agent-guards.sh`) that limits where each agent may write and
  which git commands it may run.
- Dependencies on `engineering-paved-path`, `research-tools` and `architecture-review` (`^1.0.0`).
