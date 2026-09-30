import { emptyJournal } from '@/shared/domain/journal'
import { setBaselineSmokesPerDay, setWeeklySpend } from './journal-settings'

describe('setWeeklySpend', () => {
  it('stores the weekly spend in integer cents', () => {
    expect(setWeeklySpend(emptyJournal, 3_550)).toEqual({
      ok: true,
      journal: { ...emptyJournal, weeklySpendCents: 3_550 },
    })
  })

  it.each([
    ['zero', 0],
    ['negative', -1_000],
    ['a fraction of a cent', 12.5],
    ['not a number', Number.NaN],
  ])('refuses a spend that is %s', (_, cents) => {
    expect(setWeeklySpend(emptyJournal, cents)).toEqual({ ok: false, reason: 'invalid-spend' })
  })
})

describe('setBaselineSmokesPerDay', () => {
  it('stores the baseline smokes per day', () => {
    expect(setBaselineSmokesPerDay(emptyJournal, 15)).toEqual({
      ok: true,
      journal: { ...emptyJournal, baselineSmokesPerDay: 15 },
    })
  })

  it.each([
    ['zero', 0],
    ['negative', -3],
    ['not whole', 7.5],
  ])('refuses a baseline that is %s', (_, perDay) => {
    expect(setBaselineSmokesPerDay(emptyJournal, perDay)).toEqual({
      ok: false,
      reason: 'invalid-baseline',
    })
  })
})
