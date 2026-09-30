import { local } from '@/shared/test/local-time'
import { localMidnight } from './local-day'

const HOUR = 60 * 60_000

describe('localMidnight', () => {
  it('opens the local calendar day holding the instant', () => {
    expect(localMidnight(local(9, 22, 15, 30))).toBe(local(9, 22))
    expect(localMidnight(local(9, 22, 23, 59))).toBe(local(9, 22))
  })

  it('keeps an instant at midnight sharp on the day it opens', () => {
    expect(localMidnight(local(9, 22))).toBe(local(9, 22))
  })

  it('moves by whole calendar days, forward and back', () => {
    expect(localMidnight(local(9, 22, 10), 1)).toBe(local(9, 23))
    expect(localMidnight(local(9, 22, 10), -1)).toBe(local(9, 21))
  })

  it('crosses the end of a month and of a year', () => {
    expect(localMidnight(local(9, 30, 10), 1)).toBe(local(10, 1))
    expect(localMidnight(local(12, 31, 23), 1)).toBe(local(1, 1, 0, 0, 2027))
  })

  it('keeps the spring daylight-saving day whole: 23 h to the next midnight', () => {
    // 29 March 2026: clocks go from 02:00 to 03:00 in Europe/Paris.
    expect(localMidnight(local(3, 29, 12), 1) - localMidnight(local(3, 29, 12))).toBe(23 * HOUR)
  })

  it('keeps the autumn daylight-saving day whole: 25 h to the next midnight', () => {
    // 25 October 2026: clocks go from 03:00 back to 02:00 in Europe/Paris.
    expect(localMidnight(local(10, 25, 12), 1) - localMidnight(local(10, 25, 12))).toBe(25 * HOUR)
  })
})
