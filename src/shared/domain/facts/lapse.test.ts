import { decodeJournal, emptyJournal, type Journal } from '../journal'
import { recordLapse } from './lapse'

const MINUTE = 60_000
const DAY = 24 * 60 * MINUTE
const NOW = Date.UTC(2026, 8, 22, 10, 0, 0)
const QUIT_MOMENT = NOW - 5 * DAY

const quitJournal: Journal = { ...emptyJournal, facts: [{ type: 'quit-moment', at: QUIT_MOMENT }] }

describe('recordLapse', () => {
  it('records a lapse set to now', () => {
    expect(recordLapse(quitJournal, NOW, NOW)).toEqual({
      ok: true,
      journal: { ...quitJournal, facts: [...quitJournal.facts, { type: 'lapse', at: NOW }] },
    })
  })

  it('records a backdated lapse', () => {
    const at = NOW - 2 * DAY

    expect(recordLapse(quitJournal, at, NOW)).toEqual({
      ok: true,
      journal: { ...quitJournal, facts: [...quitJournal.facts, { type: 'lapse', at }] },
    })
  })

  it('records a lapse right at the quit moment', () => {
    expect(recordLapse(quitJournal, QUIT_MOMENT, NOW).ok).toBe(true)
  })

  it('refuses a lapse in the future', () => {
    expect(recordLapse(quitJournal, NOW + MINUTE, NOW)).toEqual({ ok: false, reason: 'future' })
  })

  it('refuses a lapse before the quit moment', () => {
    expect(recordLapse(quitJournal, QUIT_MOMENT - MINUTE, NOW)).toEqual({
      ok: false,
      reason: 'before-quit-moment',
    })
  })

  it('refuses a lapse before the latest quit moment recorded', () => {
    const corrected: Journal = {
      ...quitJournal,
      facts: [...quitJournal.facts, { type: 'quit-moment', at: NOW - DAY }],
    }

    expect(recordLapse(corrected, NOW - 2 * DAY, NOW)).toEqual({
      ok: false,
      reason: 'before-quit-moment',
    })
  })

  it('refuses a lapse while there is no quit moment', () => {
    expect(recordLapse(emptyJournal, NOW, NOW)).toEqual({
      ok: false,
      reason: 'before-quit-moment',
    })
  })

  it('keeps the protocol already set', () => {
    const journal: Journal = { ...quitJournal, protocol: [{ doseMg: 14, durationDays: 21 }] }

    const result = recordLapse(journal, NOW, NOW)

    expect(result.ok && result.journal.protocol).toEqual([{ doseMg: 14, durationDays: 21 }])
  })
})

describe('lapse decoding', () => {
  it('reads a stored lapse back', () => {
    const stored = { facts: [{ type: 'lapse', at: NOW }] }

    expect(decodeJournal(stored).facts).toEqual(stored.facts)
  })

  it('drops a stored lapse without a usable time', () => {
    const stored = {
      facts: [{ type: 'lapse' }, { type: 'lapse', at: 'yesterday' }, { type: 'lapse', at: NaN }],
    }

    expect(decodeJournal(stored)).toEqual(emptyJournal)
  })
})
