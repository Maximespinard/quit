import { lapseRuns, streakRestarts } from './relapse'
import { streaks } from './streak'

/** A local wall-clock time in 2026; `month` is 1-based. The suite runs in Europe/Paris (vite.config). */
const local = (month: number, day: number, hour = 0, minute = 0) =>
  new Date(2026, month - 1, day, hour, minute).getTime()

// Quit on 1 January at 20:00; the lapses below fall on the following days.
const QUIT = local(1, 1, 20)

describe('streaks — personal best', () => {
  /** One lapse at 10:00 on each of these January days. */
  const run = (...days: number[]) => days.map((day) => ({ at: local(1, day, 10), count: 1 }))
  const personalBestAt = (now: number, lapses: ReturnType<typeof run>) =>
    streaks(QUIT, streakRestarts(lapseRuns(lapses)), now).personalBest

  it('is hidden while there is no relapse, slips included', () => {
    expect(personalBestAt(local(2, 10), [])).toBeNull()
    expect(personalBestAt(local(2, 10), run(5, 6))).toBeNull()
  })

  it('is the streak held until the relapse', () => {
    expect(personalBestAt(local(1, 9), run(5, 6, 7))).toEqual({
      elapsedMs: local(1, 7, 10) - QUIT,
    })
  })

  it('stops growing while the relapse run goes on: each further lapse day restarted the streak', () => {
    expect(personalBestAt(local(1, 9, 12), run(5, 6, 7, 8, 9))).toEqual({
      elapsedMs: local(1, 7, 10) - QUIT,
    })
  })

  it('is the current streak once it runs longer than every earlier one', () => {
    const now = local(2, 1)

    expect(personalBestAt(now, run(3, 4, 5))).toEqual({
      elapsedMs: now - local(1, 5, 10),
    })
  })
})
