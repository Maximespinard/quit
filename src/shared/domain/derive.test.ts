import { derive } from './derive'
import { emptyJournal, type Journal } from './journal'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const NOW = Date.UTC(2026, 8, 22, 10, 0, 0)

const journalWithQuitMoment = (at: number): Journal => ({
  facts: [{ type: 'quit-moment', at }],
})

describe('derive', () => {
  it('has no quit moment and no streak from an empty journal', () => {
    expect(derive(emptyJournal, NOW)).toEqual({ quitMoment: null, streak: null })
  })

  it('starts the streak at zero when the quit moment is now', () => {
    expect(derive(journalWithQuitMoment(NOW), NOW)).toEqual({
      quitMoment: NOW,
      streak: { elapsedMs: 0 },
    })
  })

  it('measures the streak from a backdated quit moment', () => {
    const quitMoment = NOW - (3 * DAY + 7 * HOUR + 4 * MINUTE)

    expect(derive(journalWithQuitMoment(quitMoment), NOW)).toEqual({
      quitMoment,
      streak: { elapsedMs: 3 * DAY + 7 * HOUR + 4 * MINUTE },
    })
  })
})
