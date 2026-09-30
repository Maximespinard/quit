import { journalWithLapses } from '@/shared/test/journals'
import { local } from '@/shared/test/local-time'
import { factId } from '@/shared/utils/fact-id'
import { derive } from './derive'
import { recordLapse } from './facts/lapse'
import type { Journal } from './journal'
import { triggersRelapse } from './relapse'

/** A local wall-clock time in January 2026. The suite runs in Europe/Paris (vite.config). */
const jan = (day: number, hour = 10) => new Date(2026, 0, day, hour).getTime()

// Quit on 1 January at 20:00; the lapses below fall on the following days.
const QUIT = jan(1, 20)
const NOW = jan(20)
const HOUR = 60 * 60_000

const journalOf = (lapses: readonly number[]): Journal => journalWithLapses(QUIT, lapses)
// The slip, relapse and lapse-day tests assert the streak, the relapses and the last cigarette
// together, as `derive` assembles them from the relapse module's runs.
const derivedAt = (now: number, lapses: readonly number[]) => derive(journalOf(lapses), now)

describe('triggersRelapse', () => {
  it('is false for a first lapse', () => {
    expect(triggersRelapse(journalOf([]), jan(19), NOW)).toBe(false)
  })

  it('is false for the second lapse day in a row', () => {
    expect(triggersRelapse(journalOf([jan(18)]), jan(19), NOW)).toBe(false)
  })

  it('is true for the third lapse day in a row', () => {
    expect(triggersRelapse(journalOf([jan(17), jan(18)]), jan(19), NOW)).toBe(true)
  })

  it('is true for a backdated lapse filling the gap between two lapse days', () => {
    expect(triggersRelapse(journalOf([jan(15), jan(17)]), jan(16), NOW)).toBe(true)
  })

  it('is true for a later lapse extending a relapse: the streak restarts again', () => {
    expect(triggersRelapse(journalOf([jan(17), jan(18), jan(19)]), jan(19, 18), NOW)).toBe(true)
  })

  it('is false for a lapse backdated inside a relapse, before its latest lapse', () => {
    expect(triggersRelapse(journalOf([jan(17), jan(18), jan(19)]), jan(18, 8), NOW)).toBe(false)
  })

  it('is false for a lapse the journal would refuse', () => {
    expect(triggersRelapse(journalOf([jan(17), jan(18)]), NOW + 1, NOW)).toBe(false)
  })
})

describe('a slip', () => {
  it('leaves the streak running from the quit moment', () => {
    const now = local(1, 10, 12)

    expect(derivedAt(now, [local(1, 5, 21)]).streak).toEqual({ elapsedMs: now - QUIT })
  })

  it('shows how long since the last cigarette', () => {
    const now = local(1, 10, 12)

    expect(derivedAt(now, [local(1, 5, 21), local(1, 9, 9)]).lastCigarette).toEqual({
      elapsedMs: now - local(1, 9, 9),
    })
  })

  it('shows no last cigarette while there is no lapse', () => {
    expect(derivedAt(local(1, 10), []).lastCigarette).toBeNull()
  })

  it('makes no relapse and no personal best', () => {
    expect(derivedAt(local(1, 10), [local(1, 5, 21)])).toMatchObject({
      relapses: [],
      personalBest: null,
    })
  })
})

describe('relapse', () => {
  it('is not reached with two calendar days in a row holding a lapse', () => {
    const now = local(1, 7, 12)

    expect(derivedAt(now, [local(1, 5, 10), local(1, 6, 22)])).toMatchObject({
      relapses: [],
      streak: { elapsedMs: now - QUIT },
    })
  })

  it('restarts the streak from the latest lapse of three days in a row', () => {
    const now = local(1, 7, 12)

    expect(derivedAt(now, [local(1, 5, 10), local(1, 6, 22), local(1, 7, 9)])).toMatchObject({
      relapses: [{ at: local(1, 7, 9) }],
      streak: { elapsedMs: 3 * HOUR },
      lastCigarette: null,
    })
  })

  it('counts a day once however many lapses it holds', () => {
    const lapses = [local(1, 5, 9), local(1, 5, 13), local(1, 5, 23), local(1, 6, 10)]

    expect(derivedAt(local(1, 7, 12), lapses).relapses).toEqual([])
  })

  it('moves the streak again with each further lapse day of the run', () => {
    const lapses = [local(1, 5, 10), local(1, 6, 22), local(1, 7, 9), local(1, 8, 8)]

    expect(derivedAt(local(1, 8, 10), lapses)).toMatchObject({
      relapses: [{ at: local(1, 8, 8) }],
      streak: { elapsedMs: 2 * HOUR },
    })
  })

  it('is broken by a day without a lapse', () => {
    const now = local(1, 9, 12)

    expect(derivedAt(now, [local(1, 5, 10), local(1, 6, 22), local(1, 8, 9)])).toMatchObject({
      relapses: [],
      streak: { elapsedMs: now - QUIT },
    })
  })

  it('counts a lapse at 23:59 then one at 00:01 as two days', () => {
    const twoDays = [local(1, 5, 23, 59), local(1, 6, 0, 1)]

    expect(derivedAt(local(1, 6, 12), twoDays)).toMatchObject({ relapses: [], lapseDaysInARow: 2 })
    expect(derivedAt(local(1, 7, 12), [...twoDays, local(1, 7, 8)]).relapses).toEqual([
      { at: local(1, 7, 8) },
    ])
  })

  it('is created after the fact by a backdated lapse completing a run', () => {
    const now = local(1, 9, 12)
    const before = journalOf([local(1, 5, 10), local(1, 7, 9)])
    const backdated = recordLapse(before, { id: factId(200), at: local(1, 6, 22), count: 1 }, now)
    if (!backdated.ok) throw new Error('the backdated lapse should be accepted')

    expect(derive(before, now).relapses).toEqual([])
    expect(derive(backdated.journal, now)).toMatchObject({
      relapses: [{ at: local(1, 7, 9) }],
      streak: { elapsedMs: now - local(1, 7, 9) },
    })
  })

  it('keeps each run apart, the streak counting from the latest', () => {
    const lapses = [
      ...[5, 6, 7].map((day) => local(1, day, 10)),
      ...[15, 16, 17].map((day) => local(1, day, 11)),
    ]

    expect(derivedAt(local(1, 20), lapses)).toMatchObject({
      relapses: [{ at: local(1, 7, 10) }, { at: local(1, 17, 11) }],
      streak: { elapsedMs: local(1, 20) - local(1, 17, 11) },
    })
  })

  it('shows the last cigarette again for a slip after a relapse', () => {
    const lapses = [local(1, 5, 10), local(1, 6, 10), local(1, 7, 10), local(1, 12, 10)]
    const now = local(1, 12, 14)

    expect(derivedAt(now, lapses)).toMatchObject({
      streak: { elapsedMs: now - local(1, 7, 10) },
      lastCigarette: { elapsedMs: 4 * HOUR },
    })
  })
})

describe('lapse days in a row', () => {
  it('counts none while there is no lapse', () => {
    expect(derivedAt(local(1, 10), []).lapseDaysInARow).toBe(0)
  })

  it('counts a lapse today or yesterday: the run is still open', () => {
    expect(derivedAt(local(1, 9, 12), [local(1, 9, 8)]).lapseDaysInARow).toBe(1)
    expect(derivedAt(local(1, 10, 23), [local(1, 9, 8)]).lapseDaysInARow).toBe(1)
  })

  it('counts none once a whole day without a lapse has passed', () => {
    expect(derivedAt(local(1, 11), [local(1, 9, 8)]).lapseDaysInARow).toBe(0)
  })

  it('counts consecutive days up to the latest', () => {
    const lapses = [local(1, 5, 8), local(1, 7, 8), local(1, 8, 8)]

    expect(derivedAt(local(1, 8, 12), lapses).lapseDaysInARow).toBe(2)
  })
})
