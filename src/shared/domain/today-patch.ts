import { PATCH_APPLICATION } from '@quit/contract/facts'
import type { PatchApplication } from './facts/patch-application'
import type { Journal } from './journal'
import { localMidnight } from './local-day'
import type { ProtocolPosition } from './protocol-position'
import { asksForPatch, protocolSpan } from './protocol-span'

/**
 * Whether today's patch application is logged, today being the local calendar day holding
 * `now`. `doseMg` is the running step's, the one a one-tap log records.
 */
export type TodayPatch =
  | ({ readonly status: 'logged' } & PatchApplication)
  | { readonly status: 'due'; readonly doseMg: number }
  /** The quit day asks for none, but its first patch is the usual first action: offered, never missing. */
  | { readonly status: 'offered'; readonly doseMg: number }
  /** From the end day on, nothing is asked. */
  | { readonly status: 'over' }

/**
 * The patch calendar's today, as the home asks it: a patch application put on between today's
 * local midnight and `now`, and after the quit moment, is today's — wherever the quit moment
 * sits in the day. Step position keeps counting protocol days; only this question follows the
 * calendar. On a tie, the one recorded last wins. Only reachable through `derive`.
 */
export function todayPatch(
  journal: Journal,
  quitMoment: number,
  position: ProtocolPosition,
  now: number,
): TodayPatch {
  const today = localMidnight(now)
  let latest: PatchApplication | null = null
  for (const fact of journal.facts) {
    if (fact.type !== PATCH_APPLICATION || fact.at < Math.max(today, quitMoment) || fact.at > now)
      continue
    if (latest === null || fact.at >= latest.at) latest = fact
  }
  if (latest !== null) {
    const { at, doseMg, site } = latest
    return site === undefined
      ? { status: 'logged', at, doseMg }
      : { status: 'logged', at, doseMg, site }
  }
  const span = protocolSpan(journal.protocol, quitMoment)
  // Before the end day the protocol still runs: the position check only narrows the type.
  if (today >= span.endDay || position.status === 'over') return { status: 'over' }
  const { doseMg } = position.step
  return asksForPatch(today, span) ? { status: 'due', doseMg } : { status: 'offered', doseMg }
}
