import { emptyJournal } from '../journal'
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
