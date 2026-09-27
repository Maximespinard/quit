import { emptyJournal, type Journal } from '../journal'
import { recordQuitMoment } from './quit-moment'

const MINUTE = 60_000
const NOW = Date.UTC(2026, 8, 22, 10, 0, 0)

describe('recordQuitMoment', () => {
  it('records a quit moment set to now', () => {
    expect(recordQuitMoment(emptyJournal, NOW, NOW)).toEqual({
      ok: true,
      journal: { ...emptyJournal, facts: [{ type: 'quit-moment', at: NOW }] },
    })
  })

  it('records a past quit moment', () => {
    const at = NOW - 90 * MINUTE

    expect(recordQuitMoment(emptyJournal, at, NOW)).toEqual({
      ok: true,
      journal: { ...emptyJournal, facts: [{ type: 'quit-moment', at }] },
    })
  })

  it('refuses a quit moment in the future', () => {
    expect(recordQuitMoment(emptyJournal, NOW + MINUTE, NOW)).toEqual({
      ok: false,
      reason: 'future',
    })
  })
})

describe('recordQuitMoment, correcting an existing quit moment', () => {
  const quitMoment = NOW - 3 * 24 * 60 * MINUTE
  const firstCraving = NOW - 2 * 24 * 60 * MINUTE
  const journal: Journal = {
    ...emptyJournal,
    facts: [
      { type: 'quit-moment', at: quitMoment },
      { type: 'lapse', at: NOW - 60 * MINUTE, count: 1 },
      { type: 'craving', at: firstCraving, intensity: 2, heldToEnd: true, tags: [] },
    ],
  }

  it('moves the quit moment earlier', () => {
    const at = quitMoment - 60 * MINUTE

    expect(recordQuitMoment(journal, at, NOW)).toEqual({
      ok: true,
      journal: { ...journal, facts: [...journal.facts, { type: 'quit-moment', at }] },
    })
  })

  it('moves the quit moment later, up to the earliest fact recorded', () => {
    expect(recordQuitMoment(journal, firstCraving, NOW).ok).toBe(true)
  })

  it('refuses a quit moment later than a fact already recorded, naming the earliest one', () => {
    expect(recordQuitMoment(journal, firstCraving + MINUTE, NOW)).toEqual({
      ok: false,
      reason: 'after-facts',
      earliestFact: firstCraving,
    })
  })
})
