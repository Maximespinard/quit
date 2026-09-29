import { DAY_MS, HOUR_MS } from '@/shared/utils/duration'
import { derive } from './derive'
import { decodeJournal, emptyJournal, type Journal } from './journal'
import { setBaselineSmokesPerDay, setWeeklySpend } from './journal-settings'
import { scenarioById } from './scenarios'

const NOW = Date.UTC(2026, 8, 22, 10, 0, 0)

/** 35 € a week and 15 a day: 5 € a day, a cigarette at 33,33… cents. */
const journal = (
  quitMoment: number,
  ...lapses: readonly [at: number, count: number][]
): Journal => ({
  ...emptyJournal,
  weeklySpendCents: 3_500,
  baselineSmokesPerDay: 15,
  facts: [
    { type: 'quit-moment', at: quitMoment },
    ...lapses.map(([at, count]) => ({ type: 'lapse' as const, at, count })),
  ],
})

describe('derive, money saved and cigarettes not smoked', () => {
  it('starts both at zero on the quit moment', () => {
    expect(derive(journal(NOW), NOW)).toMatchObject({ moneySavedCents: 0, cigarettesNotSmoked: 0 })
  })

  it('counts both from a backdated quit moment', () => {
    expect(derive(journal(NOW - 30 * DAY_MS), NOW)).toMatchObject({
      moneySavedCents: 15_000,
      cigarettesNotSmoked: 450,
    })
  })

  it('rounds down to a whole cent and a whole cigarette', () => {
    // One hour: 3 500 / 168 = 20,83… cents and 0,625 cigarette.
    expect(derive(journal(NOW - HOUR_MS), NOW)).toMatchObject({
      moneySavedCents: 20,
      cigarettesNotSmoked: 0,
    })
  })

  it('subtracts every cigarette of every lapse from both', () => {
    const derived = derive(journal(NOW - DAY_MS, [NOW - 2 * HOUR_MS, 2]), NOW)

    // 500 cents less two cigarettes at 33,33… cents: 433,33… cents.
    expect(derived).toMatchObject({ moneySavedCents: 433, cigarettesNotSmoked: 13 })
  })

  it('reads a lapse stored without a count as one cigarette', () => {
    const stored = {
      weeklySpendCents: 3_500,
      baselineSmokesPerDay: 15,
      facts: [
        { type: 'quit-moment', at: NOW - DAY_MS },
        { type: 'lapse', at: NOW - HOUR_MS },
      ],
    }

    expect(derive(decodeJournal(stored), NOW)).toMatchObject({
      moneySavedCents: 466,
      cigarettesNotSmoked: 14,
    })
  })

  it('never goes below zero when the lapses outweigh the time', () => {
    expect(derive(journal(NOW - HOUR_MS, [NOW, 5]), NOW)).toMatchObject({
      moneySavedCents: 0,
      cigarettesNotSmoked: 0,
    })
  })

  it('stays exact to the cent after years', () => {
    // 10 years at 1 000 € a week and 99 a day, one cigarette smoked: 3652 days of 142 857,14… cents.
    const decade = journal(NOW - 3_652 * DAY_MS, [NOW - DAY_MS, 1])
    const derived = derive({ ...decade, weeklySpendCents: 100_000, baselineSmokesPerDay: 99 }, NOW)

    // 100 000 × 3 652 / 7 − 100 000 / 693 = 52 171 428,57… − 144,30… = 52 171 284,27…
    expect(derived.moneySavedCents).toBe(52_171_284)
  })

  it('waits at zero while the clock sits before the quit moment', () => {
    expect(derive(journal(NOW + HOUR_MS), NOW)).toMatchObject({
      moneySavedCents: 0,
      cigarettesNotSmoked: 0,
    })
  })

  it('recomputes both at once when the weekly spend or the baseline changes', () => {
    const before = journal(NOW - 7 * DAY_MS)
    const spend = setWeeklySpend(before, 7_000)
    const baseline = setBaselineSmokesPerDay(before, 20)
    if (!spend.ok || !baseline.ok) throw new Error('valid settings refused')

    expect(derive(before, NOW)).toMatchObject({ moneySavedCents: 3_500, cigarettesNotSmoked: 105 })
    expect(derive(spend.journal, NOW).moneySavedCents).toBe(7_000)
    expect(derive(baseline.journal, NOW).cigarettesNotSmoked).toBe(140)
  })

  it('derives neither without the settings they are counted from', () => {
    const unset: Journal = { ...journal(NOW - DAY_MS), weeklySpendCents: null }
    const noBaseline: Journal = { ...journal(NOW - DAY_MS), baselineSmokesPerDay: null }

    expect(derive(unset, NOW)).toMatchObject({ moneySavedCents: null, cigarettesNotSmoked: 15 })
    // A cigarette is priced from the baseline: without it, a lapse could not be subtracted.
    expect(derive(noBaseline, NOW)).toMatchObject({
      moneySavedCents: null,
      cigarettesNotSmoked: null,
    })
  })

  it('counts a slip on day 45 against both', () => {
    const { journal: day45, now } = scenarioById('day-45-lapse')

    // 44 days 2 h at 5 € a day, 661,25 cigarettes, less the one smoked last night.
    expect(derive(day45, now)).toMatchObject({
      moneySavedCents: 22_008,
      cigarettesNotSmoked: 660,
      goal: { label: 'Un vélo', priceCents: 40_000, savedCents: 22_008, reached: false },
    })
  })
})
