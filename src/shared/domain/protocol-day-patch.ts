import { DAY_MS } from '@/shared/utils/duration'
import { PATCH_APPLICATION, type PatchApplicationInput } from './facts/patch-application'
import type { Journal } from './journal'
import { type ProtocolPosition, protocolDayIndex } from './protocol-position'

/** Whether the protocol day's patch application is logged; none is asked for once it is over. */
export type ProtocolDayPatch =
  | ({ readonly status: 'logged' } & PatchApplicationInput)
  /** `doseMg` is the running step's, the one a one-tap log records. */
  | { readonly status: 'due'; readonly doseMg: number }
  | { readonly status: 'over' }

/**
 * One patch per protocol day: the 24 h block from the quit moment that `now` falls in, the
 * same blocks the protocol position counts — not the calendar day. A patch application later
 * than `now` (a clock moved back) has not happened yet. On a tie, the one recorded last wins.
 * Only reachable through `derive`.
 */
export function protocolDayPatch(
  journal: Journal,
  quitMoment: number,
  position: ProtocolPosition,
  now: number,
): ProtocolDayPatch {
  if (position.status === 'over') return { status: 'over' }
  const from = quitMoment + protocolDayIndex(quitMoment, now) * DAY_MS
  let latest: PatchApplicationInput | null = null
  for (const fact of journal.facts) {
    if (fact.type !== PATCH_APPLICATION || fact.at < from || fact.at > now) continue
    if (latest === null || fact.at >= latest.at) latest = fact
  }
  return latest === null
    ? { status: 'due', doseMg: position.step.doseMg }
    : { status: 'logged', at: latest.at, doseMg: latest.doseMg }
}
