import { splitDuration } from './duration'

const SECOND = 1_000
const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

describe('splitDuration', () => {
  it('splits zero into an empty duration', () => {
    expect(splitDuration(0)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  })

  it('splits 3 days 7 hours 4 minutes 9 seconds', () => {
    expect(splitDuration(3 * DAY + 7 * HOUR + 4 * MINUTE + 9 * SECOND)).toEqual({
      days: 3,
      hours: 7,
      minutes: 4,
      seconds: 9,
    })
  })

  it('drops anything under a second', () => {
    expect(splitDuration(2 * MINUTE + 59 * SECOND + 999)).toEqual({
      days: 0,
      hours: 0,
      minutes: 2,
      seconds: 59,
    })
  })
})
