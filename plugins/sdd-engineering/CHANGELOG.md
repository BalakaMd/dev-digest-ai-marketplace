# Changelog

All notable changes to this plugin are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-10-15

### Added
- Agents: `spec-creator`, `implementation-planner`, `implementer`, `plan-verifier`.
- Skills: `run-plan` (explicit only), `workflow-retro` (explicit only), `engineering-insights`.
- Plugin-level guard hook (`hooks/agent-guards.sh`) that limits where each agent may write and
  which git commands it may run.
- Dependencies on `engineering-paved-path`, `research-tools` and `architecture-review` (`^1.0.0`).
