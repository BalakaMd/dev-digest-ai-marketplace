# Catalog Site Spec

A static GitHub Pages site for discovery: find a plugin, skill, agent or hook, read its
documentation, see its dependencies, and copy the install command.

Out of scope for v1: any backend, ratings, download counters, accounts, comments.

## Principles

- **Real data only.** Everything on the site comes from `.claude-plugin/marketplace.json`, the
  plugin manifests and the files inside `plugins/`. No sample or placeholder entries. If a fact is
  missing (for example a release date), the site says so instead of inventing one.
- **Static.** The whole site is files. `scripts/build-index.mjs` generates JSON and Markdown at build
  time; the browser searches it locally.
- **Same source of truth as the harness.** Plugin composition and version come from `plugin.json`;
  the marketplace file only lists which plugins exist.
- **English only, one translation file.** Every UI string lives in `site/src/i18n/en.ts` and is read
  through `t(key)`. Components never contain literal user-facing text.
- **Deployable under a sub-path.** GitHub Pages serves a project site from `/<repo>/`, so the site
  uses hash routing and relative asset URLs (`base: './'`).

## Pipeline

```
plugins/**  +  .claude-plugin/marketplace.json  +  git history
        |  node scripts/build-index.mjs
        v
site/public/index.json     searchable entries (one per plugin / skill / agent / hook)
site/public/releases.json  release feed parsed from every plugin CHANGELOG.md
site/public/stats.json     counts per kind, generation time, source commit
site/public/bodies/        full Markdown of each entry, loaded lazily on a detail page
        |  vite build (site/)
        v
site/dist/                 published to GitHub Pages
```

The generated files are git-ignored. CI regenerates them on every run.

## Entry model (`index.json`)

`index.json` has `{ meta, entries }`.

`meta`: `marketplace` (name), `repoUrl`, `marketplaceAddCommand`
(`/plugin marketplace add <owner>/<repo>`), `generatedAt`, `commit`.

Every entry has:

| Field | Meaning |
|-------|---------|
| `id` | `<kind>:<plugin>/<name>`; for a plugin `plugin:<name>` |
| `kind` | `plugin`, `skill`, `agent`, `command`, `hook`, `mcp` |
| `name` | folder or frontmatter name |
| `displayName` | humanised name (`run-plan` becomes `Run Plan`) |
| `description` | frontmatter `description`, or the `plugin.json` description for a plugin |
| `plugin` | owning plugin name |
| `keywords` | `plugin.json` keywords |
| `author` | `plugin.json` author name |
| `version` | owning plugin version |
| `updated` | date of the last commit that touched the plugin folder (`YYYY-MM-DD`) |
| `installText` | `/plugin install <plugin>@<marketplace>` |
| `githubUrl` | link to the folder or file on GitHub |
| `invocation` | `/plugin:skill` for a skill, `plugin:agent` for an agent, empty otherwise |
| `tools` | agent `tools`, skill `allowed-tools` |
| `bodyText` | plain text of the Markdown, capped, used only by search |
| `body` | path of the full Markdown file under `bodies/` |

Plugin entries add `dependencies` (`{ name, range }`), `dependents`, `counts` per kind,
`compatibility` (the minimum Claude Code version from `COMPATIBILITY.md`), and the paths of the
rendered documents: `readme`, `compatibilityDoc` and `changelog` (parsed releases).

Kinds with no entries (today: `command`, `mcp`) stay valid in the schema but the UI hides them.

## Routes

| Hash | Screen |
|------|--------|
| `#/` | Home: hero search, stats, latest releases, browse by kind |
| `#/search?q=&kind=&kw=&author=&sort=` | Search results with facets |
| `#/plugin/<name>` | Plugin detail |
| `#/artifact/<id>` | Skill, agent or hook detail |
| `#/whats-new` | Release feed |
| `#/getting-started` | Three-step install guide |

An unknown route renders a not-found screen with a link home.

## Search

- MiniSearch in the browser, built from `index.json` on load.
- Indexed fields with boost: `displayName` and `name` (5), `keywords` (3), `description` (2),
  `bodyText` (1). Prefix and fuzzy (0.2) matching, all terms required (`AND`).
- Facets: kind, keyword, author. Filters combine with AND across facets and OR within one facet.
- Sort: relevance, name, recently updated. An empty query lists everything.
- `Cmd/Ctrl+K` opens a palette that jumps straight to an entry.

## Screens

**Home.** Hero with the search box and the top keywords as chips; counters per kind; the latest four
releases; browse-by-kind buttons. Empty catalog: an explanation and links to Getting started and
CONTRIBUTING.

**Search.** Filters on the left (kind, keywords, author), result cards on the right. A card shows
kind, version, name, a two-line description, up to three keywords, the plugin and author, a
**Copy install** button and an **Open** button. No results: a message with **Reset filters**.

**Plugin detail.** Name, version, compatibility, description, author, last update; the install
command with **Copy** and **View on GitHub**; components grouped by kind; dependencies as links
(with their version ranges) and dependents; the rendered README, COMPATIBILITY and the changelog.

**Artifact detail.** Breadcrumb (Catalog / plugin / name); kind badge, name, invocation; description;
tools; the install command of the owning plugin; the rendered Markdown body.

**What's new.** Every release of every plugin, newest first. A release without a date shows
`Unreleased` and sorts first.

**Getting started.** Three steps with copyable commands: add the marketplace, install a plugin,
update. Plus a note on the difference between `marketplace update` and `plugin update`.

## Behaviour

- Markdown is rendered with `marked` and sanitised with DOMPurify before insertion.
- Theme: dark by default, a toggle switches to light; the choice is kept in `localStorage` and the
  page still works when storage is unavailable.
- Copy uses the Clipboard API with a textarea fallback and shows a toast.
- A failed fetch of `index.json` shows an error state with the reason, never a blank page.
- The layout works from 360px wide; the filters stack above the results on narrow screens.
- Every control is reachable by keyboard; the palette closes on `Esc`.

## CI

| Workflow | Trigger | Jobs |
|----------|---------|------|
| `validate.yml` | pull request | `plugins` (validate the marketplace and each plugin, test the index builder), `site-build` (build the index, type-check and build the site; a **separate job** so its status is visible apart from the harness checks) |
| `pages.yml` | push to `main` | `build` (index + site), `deploy` (publish `site/dist` to GitHub Pages) |

GitHub Pages must be set to **Source: GitHub Actions** once, in the repository settings.

## Local development

```sh
npm ci && npm --prefix site ci
npm run build:index        # generate site/public data
npm run site:dev           # Vite dev server on http://localhost:5173
npm run site:build         # production build into site/dist
npm test                   # tests of the index builder
```

## Acceptance checks

1. `npm run build:index` writes the four outputs and lists every plugin, skill, agent and hook that
   exists under `plugins/`.
2. Adding a skill folder changes the entry count after the next build, with no other edit.
3. The built site opens from a sub-path and every route works on reload.
4. Searching for a word that occurs only in a skill body finds that skill.
5. No user-facing English text in `site/src` lives outside `i18n/en.ts`.
