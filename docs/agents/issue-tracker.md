# Issue tracker: Linear

Issues, specs and tickets for this repo live in Linear, not in this repo's GitHub Issues
(those stay default/empty). Use the `mcp__linear__*` tools.

- **Team**: `Syreaz` (the only team in this workspace)
- **Project**: `quit` — every issue for this repo goes in this project, not loose in the team backlog

## Conventions

- **Create an issue**: `save_issue` with `team: "Syreaz"`, `project: "quit"`, `title`, `description` (Markdown, literal newlines — never `\n` escape sequences).
- **Read an issue**: `get_issue` by identifier (e.g. `SYR-123`) or URL.
- **List issues**: `list_issues` filtered by `project: "quit"`, plus `state` / `label` as needed.
- **Comment on an issue**: `save_comment`.
- **Apply / remove labels**: `save_issue` with `labels` (replaces the full set) — read the current set with `get_issue` first if adding one label without dropping the others.
- **Close**: `save_issue` with `state` set to `"Done"` (finished) or `"Canceled"` (won't do).

Statuses in this team: `Backlog`, `Todo`, `In Progress`, `Done`, `Canceled`, `Duplicate`.

## The spec

`/to-spec`'s output is **a Linear document**, not a file in this repo. Create it with
`save_document`, attached to the `quit` project. Ticket descriptions (`/to-tickets`) link back
to it rather than repeating it.

## When a bug or fix deserves a ticket

Not every fix does. A ticket earns its place when it carries information that the
commit message and the PR don't already carry — something to prioritise, or something
that will be looked for again later.

**Create a ticket** when the bug was found _independently_ of the work in progress:
dogfooding the app, a regression from an older milestone, anything that has to be
weighed against the other tickets before being worked on. Same for a fix that touches
an acceptance criterion or blocks another ticket. Create it already in `Todo`, or in
`In Progress` when starting it right away.

**Skip the ticket** when the fix follows on from the ticket currently in flight — a
regression in what was just built, an oversight, a typo, a CI or tooling repair. Commit
it referencing the originating identifier (`SYR-18` in the message) and let the PR carry
the reasoning. A ticket opened and closed inside ten minutes tracks nothing.

If it's ambiguous: one PR, under ~30 minutes, a single file of context → no ticket.

## When a skill says "publish to the issue tracker"

Create a Linear issue in the `quit` project (`save_issue`).

## When a skill says "fetch the relevant ticket"

`get_issue` by its identifier.

## Blocking / dependencies

Linear issues support native relations. When a skill needs to express "blocked by", use
`save_issue`'s relation fields (see the tool's own schema — check before assuming a field name,
this hasn't been exercised on this repo yet). Where that's awkward, fall back to a
`Blocked by: SYR-<n>` line at the top of the blocked issue's description.

## Wayfinding operations

Not set up yet — this repo hasn't used `/wayfinder`. If needed, adapt the GitHub-issues pattern
(a map issue + child issues) to Linear's native parent/sub-issue relation instead of a task list.
