import type { Journal } from './journal'
import { defaultProtocol } from './protocol'
import { triggersRelapse } from './relapse'

/** A local wall-clock time in January 2026. The suite runs in Europe/Paris (vite.config). */
const jan = (day: number, hour = 10) => new Date(2026, 0, day, hour).getTime()

const journalOf = (lapses: readonly number[]): Journal => ({
  protocol: defaultProtocol,
  weeklySpendCents: null,
  baselineSmokesPerDay: null,
  goal: null,
  facts: [
    { type: 'quit-moment', at: jan(1, 20) },
    ...lapses.map((at) => ({ type: 'lapse' as const, at, count: 1 })),
  ],
})

const NOW = jan(20)

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
