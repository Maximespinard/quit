import { localDay } from '@/shared/utils/local-day'
import { PATCH_APPLICATION } from './facts/patch-application'
import type { Journal } from './journal'
import type { ProtocolPosition } from './protocol-position'

/** Whether today's patch application is logged; none is asked for once the protocol is over. */
export type PatchToday =
  | { readonly status: 'logged'; readonly at: number; readonly doseMg: number }
  /** `doseMg` is the running step's, the one a one-tap log records. */
  | { readonly status: 'due'; readonly doseMg: number }
  | { readonly status: 'over' }

/**
 * "Today" is the local calendar day holding `now`, midnight to midnight. A patch application
 * later than `now` (a clock moved back) has not happened yet. Only reachable through `derive`.
 */
export function patchToday(journal: Journal, position: ProtocolPosition, now: number): PatchToday {
  if (position.status === 'over') return { status: 'over' }
  const { start } = localDay(now)
  let latest: { at: number; doseMg: number } | null = null
  for (const fact of journal.facts) {
    if (fact.type !== PATCH_APPLICATION || fact.at < start || fact.at > now) continue
    if (latest === null || fact.at > latest.at) latest = fact
  }
  return latest === null
    ? { status: 'due', doseMg: position.step.doseMg }
    : { status: 'logged', at: latest.at, doseMg: latest.doseMg }
}
