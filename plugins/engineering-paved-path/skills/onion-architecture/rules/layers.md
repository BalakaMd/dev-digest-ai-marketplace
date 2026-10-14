# Rings, in detail

The ring table in `SKILL.md` is the summary. This file is for the cases where the summary does not
settle the argument.

## Ring 1 - the domain core

Business rules with no database, no filesystem, no network and no web framework. Its only side
effects are **injected** collaborators. Anything added here must survive being called from a unit
test with no containers, no network and no environment variables. That purity is what lets the
same core run in several processes (an API, a worker, a CI job).

## Ring 2 - contracts and ports

Two different things often share one place:

- **Contracts** - schemas and inferred types that cross module or package boundaries. They are the
  vocabulary every other ring speaks.
- **Ports** - interfaces for everything the application needs from outside: a model provider, a
  source-control client, a clock, a secrets store.

A port belongs here because inner rings need it. It is not "the SDK's interface" - it is "what the
application needs from that capability", which happens to be satisfied by one SDK today. If a
contracts package is vendored or copied between packages, one copy is canonical and changes land in
all copies in the same commit.

## Ring 3 - application services

A service answers *what happens*, in domain terms, for one use case. It receives already-parsed
input and an owner or tenant identifier, calls repositories and ports, decides order, branching and
failure handling, and returns contract types. It must not import web-framework types, build URLs,
format status codes, write SQL, or construct an adapter. A long use case split across several files
is still one ring, not a new layer.

## Ring 4a - persistence

The only ring that knows the database exists; its schema is its private vocabulary. Repositories
return contract types, never raw rows, so a table change does not ripple outward.

## Ring 4b - adapters

One folder per external concern, each implementing a port. An adapter translates between the SDK's
vocabulary and ours and holds the ugliness (retries, pagination, rate limits, SDK error shapes) so
inner rings never see it. Adapters do not import each other; one may *compose* a port it receives,
which still depends on the interface. Every adapter has a test double. If an adapter is hard to
double, the port is shaped wrong.

## Ring 5 - transport

Parses and validates input at the edge exactly once, calls one service, and maps the result and
errors to the wire format. No business decisions, no persistence.

## Ring 6 - the composition root

Builds the application, wires plugins and modules, and constructs every adapter. Two properties are
easy to break:

- **Overridable.** Tests swap adapters through overrides on the root. An adapter constructed
  anywhere else is an adapter no test can replace.
- **Lazy and failing late.** If the app should boot without optional credentials, a missing secret
  must surface when that adapter is first used, not at startup. Keep that property when adding a
  getter.
