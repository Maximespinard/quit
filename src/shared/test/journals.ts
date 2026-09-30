import type { Journal } from '@/shared/domain/journal'
import { defaultProtocol } from '@/shared/domain/protocol'
import { factId } from '@/shared/utils/fact-id'

/** The quit moment, then a one-cigarette lapse at each instant given; nothing else set. */
export const journalWithLapses = (quitMoment: number, lapses: readonly number[] = []): Journal => ({
  protocol: defaultProtocol,
  weeklySpendCents: null,
  baselineSmokesPerDay: null,
  goal: null,
  facts: [
    { type: 'quit-moment', id: factId(1), at: quitMoment },
    ...lapses.map((at, i) => ({ type: 'lapse' as const, id: factId(100 + i), at, count: 1 })),
  ],
})
