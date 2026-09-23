import { decodeJournal, emptyJournal, type Journal } from '../journal'
import { recordCraving } from './craving'

const MINUTE = 60_000
const NOW = Date.UTC(2026, 8, 22, 10, 0, 0)

describe('recordCraving', () => {
  it('records a craving held to the end of the timer', () => {
    const at = NOW - 4 * MINUTE

    expect(recordCraving(emptyJournal, { at, intensity: 3, heldToEnd: true }, NOW)).toEqual({
      ok: true,
      journal: { ...emptyJournal, facts: [{ type: 'craving', at, intensity: 3, heldToEnd: true }] },
    })
  })

  it('records a craving stopped before the end, without the full-timer mark', () => {
    const at = NOW - MINUTE

    expect(recordCraving(emptyJournal, { at, intensity: 1, heldToEnd: false }, NOW)).toEqual({
      ok: true,
      journal: {
        ...emptyJournal,
        facts: [{ type: 'craving', at, intensity: 1, heldToEnd: false }],
      },
    })
  })

  it('records a backdated craving after the facts already there', () => {
    const journal: Journal = {
      ...emptyJournal,
      facts: [{ type: 'quit-moment', at: NOW - 3 * 24 * 60 * MINUTE }],
    }
    const at = NOW - 90 * MINUTE

    expect(recordCraving(journal, { at, intensity: 2, heldToEnd: false }, NOW)).toEqual({
      ok: true,
      journal: {
        ...journal,
        facts: [...journal.facts, { type: 'craving', at, intensity: 2, heldToEnd: false }],
      },
    })
  })

  it('keeps the protocol already set when recording a craving', () => {
    const journal: Journal = { facts: [], protocol: [{ doseMg: 14, durationDays: 21 }] }
    const at = NOW - MINUTE

    const result = recordCraving(journal, { at, intensity: 2, heldToEnd: false }, NOW)

    expect(result.ok && result.journal.protocol).toEqual([{ doseMg: 14, durationDays: 21 }])
  })

  it('refuses a craving in the future', () => {
    expect(
      recordCraving(emptyJournal, { at: NOW + MINUTE, intensity: 2, heldToEnd: false }, NOW),
    ).toEqual({ ok: false, reason: 'future' })
  })
})

describe('craving decoding', () => {
  it('reads a stored craving back', () => {
    const stored = { facts: [{ type: 'craving', at: NOW, intensity: 2, heldToEnd: true }] }

    expect(decodeJournal(stored).facts).toEqual(stored.facts)
  })

  it('drops a stored craving whose intensity is outside 1 to 3', () => {
    const stored = {
      facts: [
        { type: 'craving', at: NOW, intensity: 0, heldToEnd: true },
        { type: 'craving', at: NOW, intensity: 4, heldToEnd: true },
        { type: 'craving', at: NOW, intensity: 1.5, heldToEnd: true },
      ],
    }

    expect(decodeJournal(stored)).toEqual(emptyJournal)
  })

  it('drops a stored craving without its held-to-the-end mark', () => {
    expect(decodeJournal({ facts: [{ type: 'craving', at: NOW, intensity: 2 }] })).toEqual(
      emptyJournal,
    )
  })
})
