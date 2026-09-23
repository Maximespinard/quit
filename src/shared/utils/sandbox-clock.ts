/**
 * The debug panel's clock: real time, or a stopped instant, moved by an offset. It only
 * changes the `now` fed to derivation (ADR-0002) — it never touches a fact.
 */
export type SandboxClock = {
  /** The instant the clock is stopped at, or `null` to follow real time. */
  readonly stoppedAt: number | null
  readonly offsetMs: number
}

export const realTimeClock: SandboxClock = { stoppedAt: null, offsetMs: 0 }

/** A clock stopped on one instant: end-to-end tests get the same `now` on every tick. */
export const stoppedClock = (at: number): SandboxClock => ({ stoppedAt: at, offsetMs: 0 })

export const readSandboxClock = (clock: SandboxClock, realNow: number): number =>
  (clock.stoppedAt ?? realNow) + clock.offsetMs

export const shiftSandboxClock = (clock: SandboxClock, byMs: number): SandboxClock => ({
  ...clock,
  offsetMs: clock.offsetMs + byMs,
})
