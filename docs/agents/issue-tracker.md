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
