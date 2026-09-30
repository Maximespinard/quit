import { local } from '@/shared/test/local-time'
import { lapseRuns, streakRestarts } from './relapse'
import { streaks } from './streak'

// Quit on 1 January at 20:00; the lapses below fall on the following days.
const QUIT = local(1, 1, 20)

describe('streaks — personal best', () => {
  /** One lapse at 10:00 on each of these January days. */
  const lapsesOn = (...days: number[]) => days.map((day) => ({ at: local(1, day, 10), count: 1 }))
  const personalBestAt = (now: number, lapses: ReturnType<typeof lapsesOn>) =>
    streaks(QUIT, streakRestarts(lapseRuns(lapses)), now).personalBest

  it('is hidden while there is no relapse, slips included', () => {
    expect(personalBestAt(local(2, 10), [])).toBeNull()
    expect(personalBestAt(local(2, 10), lapsesOn(5, 6))).toBeNull()
  })

  it('is the streak held until the relapse', () => {
    expect(personalBestAt(local(1, 9), lapsesOn(5, 6, 7))).toEqual({
      elapsedMs: local(1, 7, 10) - QUIT,
    })
  })

  it('stops growing while the relapse run goes on: each further lapse day restarted the streak', () => {
    expect(personalBestAt(local(1, 9, 12), lapsesOn(5, 6, 7, 8, 9))).toEqual({
      elapsedMs: local(1, 7, 10) - QUIT,
    })
  })

  it('is the current streak once it runs longer than every earlier one', () => {
    const now = local(2, 1)

    expect(personalBestAt(now, lapsesOn(3, 4, 5))).toEqual({
      elapsedMs: now - local(1, 5, 10),
    })
  })
})
