import { splitDuration } from './duration'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

describe('splitDuration', () => {
  it('splits zero into zero days, hours and minutes', () => {
    expect(splitDuration(0)).toEqual({ days: 0, hours: 0, minutes: 0 })
  })

  it('splits 3 days 7 hours 4 minutes', () => {
    expect(splitDuration(3 * DAY + 7 * HOUR + 4 * MINUTE)).toEqual({
      days: 3,
      hours: 7,
      minutes: 4,
    })
  })

  it('drops the seconds', () => {
    expect(splitDuration(2 * MINUTE + 59_000)).toEqual({ days: 0, hours: 0, minutes: 2 })
  })
})
