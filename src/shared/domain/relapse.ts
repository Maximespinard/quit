import { type Lapse, lapsesUntil, recordLapse } from './facts/lapse'
import { latestQuitMoment } from './facts/quit-moment'
import type { Journal } from './journal'
import { localMidnight } from './local-day'

/** How many consecutive calendar days holding a lapse make a relapse. */
export const RELAPSE_DAYS = 3

/** Consecutive local calendar days that each hold at least one lapse. */
export type LapseRun = {
  /** Local midnight opening the run's last day. */
  readonly lastDay: number
  readonly days: number
  /** The run's latest lapse. */
  readonly latest: number
}

/** A relapse restarts the streak from the latest lapse of its run. Derived, never declared. */
export type Relapse = { readonly at: number }

/** Groups lapses, oldest first, into runs of consecutive calendar days. */
export function lapseRuns(lapses: readonly Lapse[]): LapseRun[] {
  const runs: LapseRun[] = []
  for (const { at } of lapses) {
    const day = localMidnight(at)
    const run = runs.at(-1)
    if (run !== undefined && day === run.lastDay) runs[runs.length - 1] = { ...run, latest: at }
    else if (run !== undefined && day === localMidnight(run.lastDay, 1))
      runs[runs.length - 1] = { lastDay: day, days: run.days + 1, latest: at }
    else runs.push({ lastDay: day, days: 1, latest: at })
  }
  return runs
}

/** One relapse per run long enough, dated by its latest lapse, which moves while the run goes on. */
export const relapsesOf = (runs: readonly LapseRun[]): Relapse[] =>
  runs.filter((run) => run.days >= RELAPSE_DAYS).map((run) => ({ at: run.latest }))

const relapsesAt = (journal: Journal, now: number): Relapse[] => {
  const quitMoment = latestQuitMoment(journal)
  return quitMoment === null ? [] : relapsesOf(lapseRuns(lapsesUntil(journal, quitMoment, now)))
}

/**
 * Whether declaring a lapse at `at` would restart the streak: it completes a run of
 * {@link RELAPSE_DAYS} days, or extends one past its latest lapse. Said before it lands.
 */
export function triggersRelapse(journal: Journal, at: number, now: number): boolean {
  const declared = recordLapse(journal, { at, count: 1 }, now)
  if (!declared.ok) return false
  const before = relapsesAt(journal, now)
  const after = relapsesAt(declared.journal, now)
  return after.length !== before.length || after.some((relapse, i) => relapse.at !== before[i]?.at)
}
