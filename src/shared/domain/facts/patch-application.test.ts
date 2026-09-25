import { decodeJournal, emptyJournal, type Journal } from '../journal'
import { recordPatchApplication } from './patch-application'

const HOUR = 60 * 60_000
const DAY = 24 * HOUR
const NOW = Date.UTC(2026, 8, 22, 10, 0, 0)
const QUIT_MOMENT = NOW - 3 * DAY

const quitJournal: Journal = {
  ...emptyJournal,
  facts: [{ type: 'quit-moment', at: QUIT_MOMENT }],
}

describe('recordPatchApplication', () => {
  it('records a patch application at now with its dose', () => {
    expect(recordPatchApplication(quitJournal, { at: NOW, doseMg: 21 }, NOW)).toEqual({
      ok: true,
      journal: {
        ...quitJournal,
        facts: [...quitJournal.facts, { type: 'patch-application', at: NOW, doseMg: 21 }],
      },
    })
  })

  it('records an overridden dose without touching the protocol', () => {
    const result = recordPatchApplication(quitJournal, { at: NOW, doseMg: 10.5 }, NOW)

    expect(result).toMatchObject({ ok: true, journal: { protocol: quitJournal.protocol } })
    expect(result.ok && result.journal.facts.at(-1)).toEqual({
      type: 'patch-application',
      at: NOW,
      doseMg: 10.5,
    })
  })

  it('records a backdated patch application', () => {
    const at = NOW - 2 * DAY

    expect(recordPatchApplication(quitJournal, { at, doseMg: 21 }, NOW)).toMatchObject({
      ok: true,
    })
  })

  it('records a patch application right at the quit moment', () => {
    expect(recordPatchApplication(quitJournal, { at: QUIT_MOMENT, doseMg: 21 }, NOW)).toMatchObject(
      { ok: true },
    )
  })

  it('refuses a patch application in the future', () => {
    expect(recordPatchApplication(quitJournal, { at: NOW + 1, doseMg: 21 }, NOW)).toEqual({
      ok: false,
      reason: 'future',
    })
  })

  it('refuses a patch application before the quit moment', () => {
    expect(recordPatchApplication(quitJournal, { at: QUIT_MOMENT - 1, doseMg: 21 }, NOW)).toEqual({
      ok: false,
      reason: 'before-quit-moment',
    })
  })

  it('refuses a patch application while no quit moment exists', () => {
    expect(recordPatchApplication(emptyJournal, { at: NOW, doseMg: 21 }, NOW)).toEqual({
      ok: false,
      reason: 'before-quit-moment',
    })
  })

  it('refuses a dose that is not positive', () => {
    for (const doseMg of [0, -7, Number.NaN]) {
      expect(recordPatchApplication(quitJournal, { at: NOW, doseMg }, NOW)).toEqual({
        ok: false,
        reason: 'invalid-dose',
      })
    }
  })
})

describe('patch application decoding', () => {
  it('reads a stored patch application back', () => {
    const stored = { facts: [{ type: 'patch-application', at: NOW, doseMg: 14 }] }

    expect(decodeJournal(stored).facts).toEqual(stored.facts)
  })

  it('drops a stored patch application without a valid dose', () => {
    const stored = {
      facts: [
        { type: 'patch-application', at: NOW },
        { type: 'patch-application', at: NOW, doseMg: 0 },
        { type: 'patch-application', at: NOW, doseMg: '21' },
      ],
    }

    expect(decodeJournal(stored)).toEqual(emptyJournal)
  })
})
