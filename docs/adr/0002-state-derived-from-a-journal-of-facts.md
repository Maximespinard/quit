# All state is derived from a journal of facts

Only facts are stored: the quit moment, patch applications, cravings, lapses, check-ins, the protocol and the weekly spend. Streak, XP, streak multiplier, level, badges, money saved and stats are never persisted; they are pure functions of the journal and the current time, recomputed on demand.

We chose this over storing running totals because entries can be backdated, edited or deleted, journals can be imported, and XP balancing will change: with stored totals any of these silently corrupts the numbers, while derived state is always consistent and a rebalance simply re-scores the whole history. It also makes demo mode just another journal, and makes the domain testable as "facts in, state out".

## Consequences

- The current time is an explicit input to every derivation, never read from the system clock inside domain code. Dev tooling moves time by overriding that input.
- Nothing can "grant" a level or a badge directly, not even a debug tool: the only way to reach a state is a journal and a clock that produce it.
- Changing an XP rule retroactively changes the user's level. This is accepted.
