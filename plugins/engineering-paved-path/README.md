# engineering-paved-path

The shared technical skills used by the other plugins in this marketplace - one source, loaded by
namespaced name instead of being copied into every agent.

## Skills

| Skill | Use it for |
|-------|------------|
| `engineering-paved-path:react-best-practices` | React components, hooks, state patterns and anti-patterns |
| `engineering-paved-path:react-testing-library` | Component and hook tests with React Testing Library and Vitest |
| `engineering-paved-path:next-best-practices` | Next.js file conventions, RSC boundaries, data patterns, metadata |
| `engineering-paved-path:frontend-ui-architecture` | Where components, hooks, constants and types live; how far to split |
| `engineering-paved-path:fastify-best-practices` | Fastify servers: routes, plugins, validation, errors, performance |
| `engineering-paved-path:onion-architecture` | Layering, ports and adapters, dependency injection (general guide) |
| `engineering-paved-path:drizzle-orm-patterns` | Drizzle ORM schemas, queries, relations, transactions, migrations |
| `engineering-paved-path:postgresql-table-design` | PostgreSQL schema design, types, indexing, constraints |
| `engineering-paved-path:zod` | Zod schemas, parsing and error handling |
| `engineering-paved-path:typescript-expert` | Type-level programming, performance, tooling, migrations |
| `engineering-paved-path:security` | OWASP-based review: auth, input handling, secrets, uploads |
| `engineering-paved-path:mermaid-diagram` | Mermaid diagrams for workflows, architecture, data models |

Only skills that a plugin in this marketplace actually uses are included. Adding a skill "just in
case" grows every session's discovery context, so propose a new one together with its consumer.

## Who uses it

- `architecture-review` depends on it (`onion-architecture`, `frontend-ui-architecture` as general
  vocabulary; the repository's own rules win).
- `sdd-engineering` depends on it; the planner names the skills a step needs and the implementer
  loads them with the Skill tool.

## Install

```sh
claude plugin marketplace add BalakaMd/dev-digest-ai-marketplace --scope project
claude plugin install engineering-paved-path@dev-digest-ai-marketplace --scope project
```

It is also installed automatically as a dependency of the plugins above.

## Project-agnostic by design

The skills describe general practice. Where a skill needs repository facts (folder names, layer
mapping, commands) it tells the agent to read the repository's own guidance first, and the
repository's guidance wins on any disagreement.

## Third-party content

Most skills are vendored from public sources. See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)
for origins and licence status before redistributing.

## More

[CHANGELOG.md](CHANGELOG.md) - [COMPATIBILITY.md](COMPATIBILITY.md)
