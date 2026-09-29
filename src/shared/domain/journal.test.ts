import { factId, factIdSequence } from '@/shared/test/fact-ids'
import { derive } from './derive'
import { recordLapse } from './facts/lapse'
import {
  decodeJournal,
  emptyJournal,
  giveStoredFactsIds,
  type Journal,
  removeFact,
  withFactIds,
} from './journal'
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

describe('withFactIds', () => {
  it('gives every fact without an id a new one, in order, and keeps the ids already there', () => {
    const journal: Journal = {
      ...emptyJournal,
      facts: [
        { type: 'quit-moment', at: 1_000 },
        { type: 'lapse', id: factId(90), at: 2_000, count: 1 },
        { type: 'lapse', at: 3_000, count: 2 },
      ],
    }

    expect(withFactIds(journal, factIdSequence()).facts).toEqual([
      { type: 'quit-moment', id: factId(1), at: 1_000 },
      { type: 'lapse', id: factId(90), at: 2_000, count: 1 },
      { type: 'lapse', id: factId(2), at: 3_000, count: 2 },
    ])
  })

  it('gives a new id to a fact sharing the id of one before it: two facts are never one', () => {
    const journal: Journal = {
      ...emptyJournal,
      facts: [
        { type: 'lapse', id: factId(90), at: 2_000, count: 1 },
        { type: 'lapse', id: factId(90), at: 3_000, count: 2 },
      ],
    }

    expect(withFactIds(journal, factIdSequence()).facts.map((fact) => fact.id)).toEqual([
      factId(90),
      factId(1),
    ])
  })

  it('leaves a journal whose facts all have an id as it is', () => {
    const journal: Journal = {
      ...emptyJournal,
      facts: [{ type: 'quit-moment', id: factId(90), at: 1_000 }],
    }

    expect(withFactIds(journal, factIdSequence())).toBe(journal)
  })
})

describe('giveStoredFactsIds', () => {
  it('gives every stored fact without an id one, keeping everything else as stored', () => {
    const stored = {
      facts: [
        { type: 'quit-moment', at: 1_000 },
        { type: 'lapse', id: factId(90), at: 2_000 },
        { type: 'mood', at: 3_000, level: 4 },
        'not a fact',
      ],
      weeklySpendCents: 3_550,
      protocol: 'kept as stored',
    }

    expect(giveStoredFactsIds(stored, factIdSequence())).toEqual({
      facts: [
        { type: 'quit-moment', id: factId(1), at: 1_000 },
        { type: 'lapse', id: factId(90), at: 2_000 },
        { type: 'mood', id: factId(2), at: 3_000, level: 4 },
        'not a fact',
      ],
      weeklySpendCents: 3_550,
      protocol: 'kept as stored',
    })
  })

  it.each([
    ['nothing stored', undefined],
    ['a value that is not a journal', 'journal'],
    ['facts that are not a list', { facts: 'none' }],
  ])('leaves %s as it is', (_case, stored) => {
    expect(giveStoredFactsIds(stored, factIdSequence())).toEqual(stored)
  })
})

describe('removeFact', () => {
  const HOUR = 3_600_000
  const DAY = 24 * HOUR
  const QUIT = new Date(2026, 0, 1, 12, 0).getTime()
  const journal: Journal = {
    ...emptyJournal,
    facts: [
      { type: 'quit-moment', id: factId(1), at: QUIT },
      { type: 'lapse', id: factId(2), at: QUIT + 3 * DAY, count: 1 },
      { type: 'lapse', id: factId(3), at: QUIT + 4 * DAY, count: 2 },
      { type: 'lapse', id: factId(4), at: QUIT + 5 * DAY, count: 1 },
    ],
  }
  const now = QUIT + 6 * DAY

  it('takes out the fact with that id and nothing else', () => {
    expect(removeFact(journal, factId(3)).facts).toEqual([
      { type: 'quit-moment', id: factId(1), at: QUIT },
      { type: 'lapse', id: factId(2), at: QUIT + 3 * DAY, count: 1 },
      { type: 'lapse', id: factId(4), at: QUIT + 5 * DAY, count: 1 },
    ])
  })

  it('leaves the journal as it is for an id no fact has', () => {
    expect(removeFact(journal, factId(9))).toBe(journal)
  })

  it('breaks the relapse a removed lapse completed: the streak runs from the quit moment again', () => {
    expect(derive(journal, now).personalBest).not.toBeNull()

    const state = derive(removeFact(journal, factId(3)), now)

    expect(state.streak?.elapsedMs).toBe(now - QUIT)
    expect(state.personalBest).toBeNull()
    expect(state.cigarettesSmoked).toBe(2)
  })

  it('edits a fact as removing it then recording it again, under the same rules', () => {
    const without = removeFact(journal, factId(2))

    expect(recordLapse(without, { at: QUIT - HOUR, count: 1 }, now)).toEqual({
      ok: false,
      reason: 'before-quit-moment',
    })
    expect(recordLapse(without, { at: now + HOUR, count: 1 }, now)).toEqual({
      ok: false,
      reason: 'future',
    })
  })

  it('keeps the id of a corrected fact: recorded again with it, it stays the same fact', () => {
    const without = removeFact(journal, factId(2))
    const corrected = recordLapse(without, { id: factId(2), at: QUIT + 3 * DAY, count: 3 }, now)

    expect(corrected.ok && corrected.journal.facts.filter((fact) => fact.id === factId(2))).toEqual(
      [{ type: 'lapse', id: factId(2), at: QUIT + 3 * DAY, count: 3 }],
    )
  })
})
