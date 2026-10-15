# Changelog

All notable changes to this plugin are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-10-15

### Added
- `architecture-reviewer` agent driven by repository-local architecture documentation.
- Plugin-level guard hook that restricts the reviewer's Bash to one read-only git command.
- Dependency on `engineering-paved-path` (`^1.0.0`).
