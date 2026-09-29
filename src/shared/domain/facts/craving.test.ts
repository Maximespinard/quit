import { factIdSequence } from '@/shared/test/fact-ids'
import { factId } from '@/shared/utils/fact-id'
import { decodeJournal, emptyJournal, type Journal } from '../journal'
import { recordCraving } from './craving'

const MINUTE = 60_000
const NOW = Date.UTC(2026, 8, 22, 10, 0, 0)

describe('recordCraving', () => {
  it('records a craving held to the end of the timer', () => {
    const at = NOW - 4 * MINUTE

    expect(
      recordCraving(
        emptyJournal,
        { id: factId(1), at, intensity: 3, heldToEnd: true, tags: [] },
        NOW,
      ),
    ).toEqual({
      ok: true,
      journal: {
        ...emptyJournal,
        facts: [{ type: 'craving', id: factId(1), at, intensity: 3, heldToEnd: true, tags: [] }],
      },
    })
  })

  it('records a craving stopped before the end, without the full-timer mark', () => {
    const at = NOW - MINUTE

    expect(
      recordCraving(
        emptyJournal,
        { id: factId(1), at, intensity: 1, heldToEnd: false, tags: [] },
        NOW,
      ),
    ).toEqual({
      ok: true,
      journal: {
        ...emptyJournal,
        facts: [{ type: 'craving', id: factId(1), at, intensity: 1, heldToEnd: false, tags: [] }],
      },
    })
  })

  it('records a backdated craving after the facts already there', () => {
    const journal: Journal = {
      ...emptyJournal,
      facts: [{ type: 'quit-moment', id: factId(1), at: NOW - 3 * 24 * 60 * MINUTE }],
    }
    const at = NOW - 90 * MINUTE

    expect(
      recordCraving(journal, { id: factId(2), at, intensity: 2, heldToEnd: false, tags: [] }, NOW),
    ).toEqual({
      ok: true,
      journal: {
        ...journal,
        facts: [
          ...journal.facts,
          { type: 'craving', id: factId(2), at, intensity: 2, heldToEnd: false, tags: [] },
        ],
      },
    })
  })

  it('keeps the protocol already set when recording a craving', () => {
    const journal: Journal = { ...emptyJournal, protocol: [{ doseMg: 14, durationDays: 21 }] }
    const at = NOW - MINUTE

    const result = recordCraving(
      journal,
      { id: factId(1), at, intensity: 2, heldToEnd: false, tags: [] },
      NOW,
    )

    expect(result.ok && result.journal.protocol).toEqual([{ doseMg: 14, durationDays: 21 }])
  })

  it('records the tags picked for a craving', () => {
    const at = NOW - MINUTE

    const result = recordCraving(
      emptyJournal,
      { id: factId(1), at, intensity: 2, heldToEnd: true, tags: ['coffee', 'Yoga'] },
      NOW,
    )

    expect(result.ok && result.journal.facts).toEqual([
      {
        type: 'craving',
        id: factId(1),
        at,
        intensity: 2,
        heldToEnd: true,
        tags: ['coffee', 'Yoga'],
      },
    ])
  })

  it('trims the tags, drops the blank ones and merges those differing only by case or spacing', () => {
    const at = NOW - MINUTE

    const result = recordCraving(
      emptyJournal,
      {
        id: factId(1),
        at,
        intensity: 1,
        heldToEnd: false,
        tags: ['  Jeu   vidéo ', 'jeu vidéo', '   ', 'JEU VIDÉO', 'stress'],
      },
      NOW,
    )

    expect(result.ok && result.journal.facts).toEqual([
      {
        type: 'craving',
        id: factId(1),
        at,
        intensity: 1,
        heldToEnd: false,
        tags: ['Jeu vidéo', 'stress'],
      },
    ])
  })

  it('refuses a craving in the future', () => {
    expect(
      recordCraving(
        emptyJournal,
        { id: factId(1), at: NOW + MINUTE, intensity: 2, heldToEnd: false, tags: [] },
        NOW,
      ),
    ).toEqual({ ok: false, reason: 'future' })
  })
})

describe('craving decoding', () => {
  it('reads a stored craving back', () => {
    const stored = {
      facts: [{ type: 'craving', id: factId(1), at: NOW, intensity: 2, heldToEnd: true, tags: [] }],
    }

    expect(decodeJournal(stored, factIdSequence()).facts).toEqual(stored.facts)
  })

  it('drops a stored craving whose intensity is outside 1 to 3', () => {
    const stored = {
      facts: [
        { type: 'craving', id: factId(1), at: NOW, intensity: 0, heldToEnd: true, tags: [] },
        { type: 'craving', id: factId(2), at: NOW, intensity: 4, heldToEnd: true, tags: [] },
        { type: 'craving', id: factId(3), at: NOW, intensity: 1.5, heldToEnd: true, tags: [] },
      ],
    }

    expect(decodeJournal(stored, factIdSequence())).toEqual(emptyJournal)
  })

  it('reads a stored craving back with its tags', () => {
    const stored = {
      facts: [
        {
          type: 'craving',
          id: factId(1),
          at: NOW,
          intensity: 2,
          heldToEnd: true,
          tags: ['meal', 'Yoga'],
        },
      ],
    }

    expect(decodeJournal(stored, factIdSequence()).facts).toEqual(stored.facts)
  })

  it('reads a craving stored before tags existed as one without tags', () => {
    const stored = {
      facts: [{ type: 'craving', id: factId(1), at: NOW, intensity: 2, heldToEnd: true }],
    }

    expect(decodeJournal(stored, factIdSequence()).facts).toEqual([
      { type: 'craving', id: factId(1), at: NOW, intensity: 2, heldToEnd: true, tags: [] },
    ])
  })

  it('drops a stored craving whose tags are not a list of words', () => {
    const stored = {
      facts: [
        { type: 'craving', id: factId(1), at: NOW, intensity: 2, heldToEnd: true, tags: 'coffee' },
        {
          type: 'craving',
          id: factId(2),
          at: NOW,
          intensity: 2,
          heldToEnd: true,
          tags: ['coffee', 3],
        },
      ],
    }

    expect(decodeJournal(stored, factIdSequence())).toEqual(emptyJournal)
  })

  it('drops a stored craving without its held-to-the-end mark', () => {
    expect(
      decodeJournal(
        { facts: [{ type: 'craving', id: factId(1), at: NOW, intensity: 2 }] },
        factIdSequence(),
      ),
    ).toEqual(emptyJournal)
  })
})
