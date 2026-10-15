# dev-digest-ai-marketplace

A Claude Code plugin marketplace with reusable, project-agnostic AI engineering components:
skills, agents and workflows for spec-driven development.

## Plugins

| Plugin | Purpose | Depends on |
|--------|---------|------------|
| `engineering-paved-path` | Shared technical skills (React, testing, Next.js, Fastify, Drizzle, security, ...) | — |
| `research-tools` | Read-only `researcher` agent | — |
| `architecture-review` | `architecture-reviewer` agent driven by repository-local architecture docs | `engineering-paved-path` |
| `sdd-engineering` | Spec → plan → implement → verify workflow | all three above |

## Install

```sh
claude plugin marketplace add BalakaMd/dev-digest-ai-marketplace --scope project
claude plugin install sdd-engineering@dev-digest-ai-marketplace --scope project
```

Dependencies are installed automatically. Requires Claude Code `>=2.1.110`.

## Repository layout

```
.claude-plugin/marketplace.json   catalog of plugins (source of truth for the catalog)
plugins/<name>/                   one directory per plugin, each with .claude-plugin/plugin.json
docs/                             guidelines, security, releases, site spec, cost baseline
scripts/build-index.mjs           builds the catalog data (index, releases, stats, bodies) for the site
scripts/check-english.mjs         fails when a tracked file contains Cyrillic text
site/                             static catalog (React + Vite) published to GitHub Pages
```

## Catalog site

The catalog is a static site (React + TypeScript + Vite, client-side search) built from the real
plugin files. Spec: [docs/SITE-SPEC.md](docs/SITE-SPEC.md).

```sh
npm ci && npm --prefix site ci
npm run site:dev      # build the index, then start the dev server on http://localhost:5173
npm run site:build    # production build into site/dist
npm test              # tests of the index builder
```

Pull requests run `.github/workflows/validate.yml` (plugin checks and, as a separate job, the site
build). A merge to `main` runs `.github/workflows/pages.yml`, which publishes the site.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) first. Releases and rollback: [docs/RELEASES.md](docs/RELEASES.md).
Security rules: [docs/SECURITY.md](docs/SECURITY.md).
