# Parallel instances and token budget

Read this before launching more than one instance of an agent, or resuming one.

## Parallel instances

implementer may run as several instances at once, all in the same working tree. Split the work
only when every condition below holds; if any is in doubt, run one instance.

1. **Disjoint files.** No file is in two groups, including files an instance would create. Take
   the file lists from the plan's steps. A step without an explicit file list goes into a group of
   its own and runs sequentially.
2. **No dependency.** No step in one group depends on a step in another group running at the same
   time. Dependent steps run in a later wave.
3. **No shared verification state.** Instances running at the same time must not run checks
   against the same package, database, container or fixed port. Different packages or modules are
   safe. Two groups inside one package run in parallel only if each runs just its own targeted
   tests.
4. **No shared generated files.** Lockfiles, migrations, generated code and shared contract copies
   belong to exactly one group, and nothing else in that wave touches them.
5. **At most three instances per wave.**
6. **Each group is worth an instance.** Splitting adds a cold start per instance and a full
   re-verification afterwards; it saves time, not tokens. Split only when each group is
   substantial (roughly eight or more files, or a whole package of work).

How to run a wave:

- Launch all instances of the wave in one message. Number them (`implementer #1`, ...).
- Tell each instance which steps are its own, list the files other instances own and forbid it
  to edit them, and say that other instances work in the same tree at the same time. An instance
  that needs a file outside its group stops and reports.
- After the wave, compare `git status --porcelain` with each instance's report of changed files.
  A file changed by two instances, or by none that claims it, is a conflict: show it to the user
  before going on.
- Because the instances' checks ran while other files were still changing, run the full type check
  and test suites of every touched package once in this session after the last wave. Send any
  failure to a single implementer to fix.

## Token budget

- **Instance size.** Give one implementer instance at most about twelve files to create or modify
  across its steps, and at most one step that creates a new module. Beyond that, run the steps as
  sequential instances. An instance that carries too much runs out of turns and re-reads its
  growing context on every turn.
- **Instance count.** Before launching a stage, check whether it earns its cold start: a
  researcher whose question the planner will answer anyway, or a second parallel instance with only
  a few files each, do not.
- **Fresh instance or resume.** A resumed instance re-reads its whole history on every turn, so
  its cost grows with each resume. Resume (`SendMessage`) only to answer the instance's own
  question, to let it finish a step it stopped in, or for a small fix in files it just wrote while
  its history is still short (roughly under forty turns). Start a fresh instance for a new phase -
  the next group of plan steps, a fix round after review - and hand it only what the phase needs:
  the plan path, its step ids or findings, the files changed so far, and the files it may touch.
- **Model choice.** Narrow tasks run with `model: "sonnet"` even when the agent's definition says
  otherwise: a second run of a reviewer or verifier re-checking named findings, and small targeted
  lookups. Keep the agent's own model for planning, first reviews and implementing plan steps.
- **Reports.** Ask every agent for a compact report: results, `file:line` evidence, commands with
  exit codes, open items. You relay it; long reports cost you context.
