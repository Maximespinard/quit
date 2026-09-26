import { derive } from './derive'
import { recordLapse } from './facts/lapse'
import { decodeJournal, emptyJournal, type Journal, removeFact } from './journal'
import { defaultProtocol } from './protocol'

describe('decodeJournal', () => {
  it('reads nothing stored as a new journal', () => {
    expect(decodeJournal(undefined)).toEqual(emptyJournal)
  })

  it('gives a journal stored before the protocol existed the default protocol, facts kept', () => {
    const stored = { facts: [{ type: 'quit-moment', at: 1_000 }] }

    expect(decodeJournal(stored)).toEqual({
      ...emptyJournal,
      facts: [{ type: 'quit-moment', at: 1_000 }],
      protocol: defaultProtocol,
    })
  })

  it('reads back an edited protocol', () => {
    const protocol = [{ doseMg: 14, durationDays: 21, brand: 'Nicopatch' }]

    expect(decodeJournal({ facts: [], protocol })).toEqual({ ...emptyJournal, protocol })
  })
})

describe('decodeJournal, settings', () => {
  it('reads back the weekly spend and the baseline', () => {
    const stored = { facts: [], weeklySpendCents: 3_550, baselineSmokesPerDay: 15 }

    expect(decodeJournal(stored)).toEqual({
      ...emptyJournal,
      weeklySpendCents: 3_550,
      baselineSmokesPerDay: 15,
    })
  })

  it('reads a journal stored before the settings existed as not set yet', () => {
    const decoded = decodeJournal({ facts: [] })

    expect(decoded.weeklySpendCents).toBeNull()
    expect(decoded.baselineSmokesPerDay).toBeNull()
  })

  it('drops a malformed spend or baseline rather than trusting it', () => {
    const decoded = decodeJournal({ facts: [], weeklySpendCents: 12.5, baselineSmokesPerDay: -2 })

    expect(decoded.weeklySpendCents).toBeNull()
    expect(decoded.baselineSmokesPerDay).toBeNull()
  })
})

describe('removeFact', () => {
  const HOUR = 3_600_000
  const DAY = 24 * HOUR
  const QUIT = new Date(2026, 0, 1, 12, 0).getTime()
  const journal: Journal = {
    ...emptyJournal,
    facts: [
      { type: 'quit-moment', at: QUIT },
      { type: 'lapse', at: QUIT + 3 * DAY, count: 1 },
      { type: 'lapse', at: QUIT + 4 * DAY, count: 2 },
      { type: 'lapse', at: QUIT + 5 * DAY, count: 1 },
    ],
  }
  const now = QUIT + 6 * DAY

  it('takes out the fact at that index and nothing else', () => {
    expect(removeFact(journal, 2).facts).toEqual([
      { type: 'quit-moment', at: QUIT },
      { type: 'lapse', at: QUIT + 3 * DAY, count: 1 },
      { type: 'lapse', at: QUIT + 5 * DAY, count: 1 },
    ])
  })

  it('leaves the journal as it is for an index holding no fact', () => {
    expect(removeFact(journal, 9)).toBe(journal)
    expect(removeFact(journal, -1)).toBe(journal)
  })

  it('breaks the relapse a removed lapse completed: the streak runs from the quit moment again', () => {
    expect(derive(journal, now).personalBest).not.toBeNull()

    const state = derive(removeFact(journal, 2), now)

    expect(state.streak?.elapsedMs).toBe(now - QUIT)
    expect(state.personalBest).toBeNull()
    expect(state.cigarettesSmoked).toBe(2)
  })

  it('edits a fact as removing it then recording it again, under the same rules', () => {
    const without = removeFact(journal, 1)

    expect(recordLapse(without, { at: QUIT - HOUR, count: 1 }, now)).toEqual({
      ok: false,
      reason: 'before-quit-moment',
    })
    expect(recordLapse(without, { at: now + HOUR, count: 1 }, now)).toEqual({
      ok: false,
      reason: 'future',
    })
  })
})
