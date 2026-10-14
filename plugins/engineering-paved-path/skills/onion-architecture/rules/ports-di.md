# Ports and dependency injection

## What a port is

An interface, declared in the contracts ring, named for the capability the application needs
(`ModelProvider`, `SourceControlClient`, `Clock`), never for the SDK that implements it. Methods
take and return contract types, not SDK types.

## Adding a port and an adapter

1. Declare the interface in the contracts ring, in the application's vocabulary.
2. Implement it as an adapter in its own folder; translate SDK types at the edge.
3. Add a test double that implements the same interface.
4. Expose it through the composition root (a lazy getter or a factory) and make it overridable.
5. Use it only through the interface: a service takes the port in its constructor.

## Injection rules

- **Constructor injection.** A service lists its dependencies in its constructor signature. It does
  not take the whole container and pull from it (that is a service locator, which hides what the
  service needs and makes tests heavy).
- **One composition root.** Only the root names concrete classes. Searching for `new ConcreteThing`
  outside the root and the tests should find nothing.
- **Repositories take the database handle** the same way; they do not import a global connection.
- **No fetching at import time.** Modules do not read environment variables or open connections as a
  side effect of being imported; the root does that and passes the result down.

## Smells

| Smell | Meaning |
|-------|---------|
| A service imports an adapter folder | the port is missing or bypassed |
| A constructor takes `Container` / `Context` | service locator; list explicit dependencies |
| A test needs the network or a database to exercise logic | logic is in the wrong ring, or a port is missing |
| A port method returns an SDK type | the SDK leaked through the interface |
| An adapter imports another adapter | compose through a port instead |
