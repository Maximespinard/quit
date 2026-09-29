import { type Lapse, lapseRefusal, lapsesUntil } from './facts/lapse'
import { latestQuitMoment } from './facts/quit-moment'
import type { Journal } from './journal'
import { localMidnight } from './local-day'
import type { Elapsed } from './streak'

/** How many consecutive calendar days holding a lapse make a relapse. */
export const RELAPSE_DAYS = 3

/** Consecutive local calendar days that each hold at least one lapse. */
export type LapseRun = {
  /** Local midnight opening the run's last day. */
  readonly lastDay: number
  readonly days: number
  /** The run's latest lapse. */
  readonly latest: number
  /** Its lapses from the {@link RELAPSE_DAYS}th day on: each one restarted the streak. */
  readonly restarts: readonly number[]
}

/** A relapse restarts the streak from the latest lapse of its run. Derived, never declared. */
export type Relapse = { readonly at: number }

/** Groups lapses, oldest first, into runs of consecutive calendar days. */
export function lapseRuns(lapses: readonly Lapse[]): LapseRun[] {
  const runs: LapseRun[] = []
  for (const { at } of lapses) {
    const day = localMidnight(at)
    const run = runs.at(-1)
    const sameDay = run !== undefined && day === run.lastDay
    const nextDay = run !== undefined && day === localMidnight(run.lastDay, 1)
    if (run === undefined || !(sameDay || nextDay)) {
      runs.push({ lastDay: day, days: 1, latest: at, restarts: [] })
      continue
    }
    const days = nextDay ? run.days + 1 : run.days
    const restarts = days >= RELAPSE_DAYS ? [...run.restarts, at] : run.restarts
    runs[runs.length - 1] = { lastDay: day, days, latest: at, restarts }
  }
  return runs
}

/** One relapse per run long enough, dated by its latest lapse, which moves while the run goes on. */
export const relapsesOf = (runs: readonly LapseRun[]): Relapse[] =>
  runs.filter((run) => run.days >= RELAPSE_DAYS).map((run) => ({ at: run.latest }))

/** The latest run while it is still open: its last day is today or yesterday. */
export const openRun = (runs: readonly LapseRun[], now: number): LapseRun | null => {
  const latest = runs.at(-1)
  return latest !== undefined && latest.lastDay >= localMidnight(now, -1) ? latest : null
}

/** Since the latest lapse, while it is a slip: once part of a relapse, the streak says it. */
export const lastSlip = (runs: readonly LapseRun[], now: number): Elapsed | null => {
  const latest = runs.at(-1)
  return latest === undefined || latest.days >= RELAPSE_DAYS
    ? null
    : { elapsedMs: now - latest.latest }
}

/** Every moment the streak restarted, oldest first. */
export const streakRestarts = (runs: readonly LapseRun[]): number[] =>
  runs.flatMap((run) => run.restarts)

/**
 * Whether declaring a lapse at `at` would restart the streak: it completes a run of
 * {@link RELAPSE_DAYS} days, or extends one past its latest lapse. Said before it lands.
 */
export function triggersRelapse(journal: Journal, at: number, now: number): boolean {
  const declared = { at, count: 1 }
  const quitMoment = latestQuitMoment(journal)
  if (quitMoment === null || lapseRefusal(journal, declared, now) !== null) return false
  const lapses = lapsesUntil(journal, quitMoment, now)
  const before = relapsesOf(lapseRuns(lapses))
  const after = relapsesOf(lapseRuns([...lapses, declared].sort((a, b) => a.at - b.at)))
  return after.length !== before.length || after.some((relapse, i) => relapse.at !== before[i]?.at)
}
