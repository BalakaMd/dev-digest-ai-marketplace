# Contributing

This guide answers three questions without needing to ask anyone: where do files go,
what must be in them, and what do I run before opening a pull request.

## Plugin structure

```
plugins/<plugin-name>/
├── .claude-plugin/
│   └── plugin.json        required — the only manifest
├── skills/<skill-name>/SKILL.md   optional
├── agents/<agent-name>.md         optional
├── hooks/                         optional
├── evals/                         behavior evals for the plugin
├── README.md              required — what it does, how to use it
├── CHANGELOG.md           required — Keep a Changelog format
└── COMPATIBILITY.md       required — minimum Claude Code version, known limits
```

Only `.claude-plugin/plugin.json` lives inside `.claude-plugin/`. Components sit at the plugin root.

## Manifest fields (`plugin.json`)

| Field | Required | Notes |
|-------|----------|-------|
| `name` | yes | kebab-case, equal to the directory name and the marketplace entry name |
| `version` | yes | SemVer, bumped on every release (see `docs/RELEASES.md`) |
| `description` | yes | one sentence, English |
| `dependencies` | if any | `{ "name": "<plugin>", "version": "^1.0.0" }` entries |

Do not repeat `version` or component lists in `marketplace.json` — `plugin.json` is the source of truth.

## Dependency rules

1. Shared technical skills live once, in `engineering-paved-path`. Never copy a skill into an agent or another plugin.
2. Reference dependency components by namespaced name: `engineering-paved-path:react-best-practices`.
3. Every dependency uses a caret range (`^1.0.0`). Release dependencies before their consumers.
4. No circular dependencies. Keep the graph shallow.

## Portability rules

- No absolute paths, no product or repository names (nothing specific to one project).
- Plugin-level files: `${CLAUDE_PLUGIN_ROOT}`. Scripts inside a skill: `${CLAUDE_SKILL_DIR}`.
- No credentials in any file. See `docs/SECURITY.md`.
- Everything — code, comments, README, descriptions — is written in English.

## Checks to run locally

```sh
claude plugin validate ./plugins/<plugin-name>
claude plugin validate .
npm run build:index
```

## Pull request checklist

- [ ] Plugin lives under `plugins/<name>/` with the required files
- [ ] `plugin.json` name matches directory and marketplace entry
- [ ] Version bumped and `CHANGELOG.md` updated for any behavior change
- [ ] Dependencies are namespaced and use caret ranges
- [ ] No absolute paths, secrets, or project-specific names
- [ ] `claude plugin validate` passes, evals pass
- [ ] Reviewed by the owning team (see `CODEOWNERS`)
