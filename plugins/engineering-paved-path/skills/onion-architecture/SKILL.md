---
name: onion-architecture
description: "General guide to Onion / ports-and-adapters architecture for backend code in any language or framework. Use BEFORE writing or reviewing server-side code: adding or changing a module, a route or controller, a service, a repository, an adapter or a port, wiring a dependency-injection container, writing a database query, or deciding where a piece of logic belongs. Gives the rings, the dependency rule, a placement guide, a review checklist and a method for deriving grep self-checks from the repository's own layout. It is vocabulary and method, not the repository's rules: the repository's own architecture documents win. Trigger terms: architecture, layering, dependency rule, ports and adapters, hexagonal, clean architecture, repository pattern, dependency injection, business logic in the controller, where should this code live."
metadata:
  tags: architecture, onion, hexagonal, backend, dependency-injection, layering
---

# Onion architecture - a portable guide

This skill is general vocabulary and method. **It is not the rule set of any one repository.**
First find the repository's own description of its layers (an architecture document, `AGENTS.md`,
`CLAUDE.md`, a path-to-layer routing map) and map this skill's rings onto it. Where the two
disagree, the repository wins: follow its rule and mention the divergence.

## The one rule

> Code can depend on layers more central, but never on layers further out from the core.

Two consequences do all the work:

1. **Inner rings declare interfaces; outer rings implement them.** A port lives next to the code
   that *needs* it, not next to the SDK that satisfies it.
2. **Dependencies are given, never fetched.** A ring receives what it needs through its
   constructor or parameters. Reaching out for a dependency - importing a concrete adapter, or
   taking the whole container - inverts the arrow.

## The rings

| Ring | What it is | May depend on |
|------|------------|---------------|
| 1 - Domain core | pure business rules, no IO | nothing but the language and a schema library |
| 2 - Contracts and ports | data contracts and interfaces for everything the core needs from outside | ring 1 |
| 3 - Application | use-case orchestration: order, branching, failure handling | rings 1-2 |
| 4a - Persistence | queries, row-to-contract mapping | rings 1-2 and the database library |
| 4b - Adapters | the outside world (HTTP clients, queues, SDKs), behind a port | rings 1-2 and its own SDK |
| 5 - Transport | HTTP/RPC handlers, serialization, status codes | rings 1-3 |
| 6 - Composition root | constructs and wires everything | everything |

The asymmetry worth memorising: **the composition root is the only place allowed to name a
concrete class.** Everything else knows an interface.

Repositories rarely have all seven pieces. Smaller systems merge rings (for example 3 and 4a); the
rule still holds between whatever rings exist. Record the mapping you found before reviewing.

## Where does this code go?

- Deterministic, no IO, meaningful without a database -> core (ring 1).
- Coordinates several steps, decides *what* happens -> application service (ring 3).
- Speaks SQL -> repository (ring 4a).
- Only makes sense over HTTP (status codes, query strings, streaming framing) -> transport (ring 5).
- Calls something outside the process -> a port (ring 2) plus an adapter (ring 4b).
- Decides *which* implementation is used -> composition root (ring 6).

If a piece of logic seems to need two of these, it is two pieces of logic.

Ask, when it is genuinely unclear: which ring would have to change if this external fact changed?
A table layout change belongs in persistence only; a vendor change belongs in an adapter only; a
change in step order belongs in a service. If one change forces edits in rings 1 and 4 at once, a
concept is leaking - usually an infrastructure type used as a domain type.

## Adding a module

1. Repository: takes the database handle in its constructor, returns contract types (not ORM
   rows), scopes every query by the tenant or owner key if the system has one.
2. Service: takes explicit dependencies (repository, ports). No framework types, no SQL.
3. Transport handler: validates input once, makes one service call per route, maps errors to
   status codes.
4. Register the module wherever the repository registers modules.

Write the service even when it is a four-line pass-through. The thin service is the seam that lets
transport stay ignorant of persistence; skipping it is how handlers end up querying the database.

## Review checklist

A "no" is a finding, not a preference.

1. Does every new handler end in a single service call?
2. Is the database or ORM imported only from persistence files?
3. Does persistence return contract types rather than raw rows?
4. Does the new service declare its dependencies in its constructor signature instead of taking the
   whole container?
5. Does every call to something outside the process go through a port?
6. Is the new port declared in the contracts ring, implemented as an adapter, mockable in tests,
   and exposed through the composition root?
7. Is input parsed exactly once, at the boundary?
8. Does the core still import nothing outside itself and the schema library?
9. Can the new logic be tested without a database? If not, it is in the wrong ring.

## Deriving self-checks

Turn each rule into a search over the repository's own layout, and run it instead of trusting a
snapshot. Match on the import clause, not a bare word, so prose in comments does not trigger it.

| Rule | Search for |
|------|------------|
| only persistence reaches the database | database or ORM imports outside persistence files |
| modules never name a concrete adapter | imports of the adapter folder from application or transport code |
| services do not take the container | constructors or parameters typed as the container |
| the core stays pure | framework, database or SDK imports under the core folder |

If the repository documents its own self-check commands, run those instead.

## Known deviations

Repositories drift. If the architecture documents list known deviations or accepted baselines,
do not "fix" them opportunistically in an unrelated change: match the pattern of the ring you are
in, leave the deviation, and mention it.

## Deeper reading

| File | Read it when |
|------|--------------|
| [rules/layers.md](rules/layers.md) | you are unsure which ring a file belongs to |
| [rules/ports-di.md](rules/ports-di.md) | adding an adapter, a port, or a service constructor |
