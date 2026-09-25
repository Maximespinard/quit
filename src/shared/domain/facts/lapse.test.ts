import { decodeJournal, emptyJournal, type Journal } from '../journal'
import { recordLapse } from './lapse'

const MINUTE = 60_000
const DAY = 24 * 60 * MINUTE
const NOW = Date.UTC(2026, 8, 22, 10, 0, 0)
const QUIT_MOMENT = NOW - 5 * DAY

const quitJournal: Journal = { ...emptyJournal, facts: [{ type: 'quit-moment', at: QUIT_MOMENT }] }

describe('recordLapse', () => {
  it('records a lapse set to now', () => {
    expect(recordLapse(quitJournal, { at: NOW, count: 1 }, NOW)).toEqual({
      ok: true,
      journal: {
        ...quitJournal,
        facts: [...quitJournal.facts, { type: 'lapse', at: NOW, count: 1 }],
      },
    })
  })

  it('records a backdated lapse with its number of cigarettes', () => {
    const at = NOW - 2 * DAY

    expect(recordLapse(quitJournal, { at, count: 3 }, NOW)).toEqual({
      ok: true,
      journal: { ...quitJournal, facts: [...quitJournal.facts, { type: 'lapse', at, count: 3 }] },
    })
  })

  it('records a lapse right at the quit moment', () => {
    expect(recordLapse(quitJournal, { at: QUIT_MOMENT, count: 1 }, NOW).ok).toBe(true)
  })

  it('refuses a lapse in the future', () => {
    expect(recordLapse(quitJournal, { at: NOW + MINUTE, count: 1 }, NOW)).toEqual({
      ok: false,
      reason: 'future',
    })
  })

  it('refuses a lapse before the quit moment', () => {
    expect(recordLapse(quitJournal, { at: QUIT_MOMENT - MINUTE, count: 1 }, NOW)).toEqual({
      ok: false,
      reason: 'before-quit-moment',
    })
  })

  it('refuses a lapse before the latest quit moment recorded', () => {
    const corrected: Journal = {
      ...quitJournal,
      facts: [...quitJournal.facts, { type: 'quit-moment', at: NOW - DAY }],
    }

    expect(recordLapse(corrected, { at: NOW - 2 * DAY, count: 1 }, NOW)).toEqual({
      ok: false,
      reason: 'before-quit-moment',
    })
  })

  it('refuses a lapse while there is no quit moment', () => {
    expect(recordLapse(emptyJournal, { at: NOW, count: 1 }, NOW)).toEqual({
      ok: false,
      reason: 'before-quit-moment',
    })
  })

  it.each([0, -1, 1.5, Number.NaN])('refuses %s cigarettes', (count) => {
    expect(recordLapse(quitJournal, { at: NOW, count }, NOW)).toEqual({
      ok: false,
      reason: 'invalid-count',
    })
  })

  it('keeps the protocol already set', () => {
    const journal: Journal = { ...quitJournal, protocol: [{ doseMg: 14, durationDays: 21 }] }

    const result = recordLapse(journal, { at: NOW, count: 1 }, NOW)

    expect(result.ok && result.journal.protocol).toEqual([{ doseMg: 14, durationDays: 21 }])
  })
})

describe('lapse decoding', () => {
  it('reads a stored lapse back', () => {
    const stored = { facts: [{ type: 'lapse', at: NOW, count: 2 }] }

    expect(decodeJournal(stored).facts).toEqual(stored.facts)
  })

  it('reads a lapse stored before it had a count as one cigarette', () => {
    expect(decodeJournal({ facts: [{ type: 'lapse', at: NOW }] }).facts).toEqual([
      { type: 'lapse', at: NOW, count: 1 },
    ])
  })

  it('drops a stored lapse whose count is not a whole number of cigarettes', () => {
    const stored = {
      facts: [
        { type: 'lapse', at: NOW, count: 0 },
        { type: 'lapse', at: NOW, count: 2.5 },
        { type: 'lapse', at: NOW, count: '2' },
      ],
    }

    expect(decodeJournal(stored)).toEqual(emptyJournal)
  })

  it('drops a stored lapse without a usable time', () => {
    const stored = {
      facts: [{ type: 'lapse' }, { type: 'lapse', at: 'yesterday' }, { type: 'lapse', at: NaN }],
    }

    expect(decodeJournal(stored)).toEqual(emptyJournal)
  })
})
