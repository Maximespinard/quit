import { clockDateTime, formatClock } from './format-clock'

describe('formatClock', () => {
  it('shows the day, the date, the hour and the minutes, no seconds', () => {
    // Tests run in Europe/Paris: 15:50:02 UTC is 17:50:02 there.
    expect(formatClock(Date.UTC(2026, 8, 23, 15, 50, 2))).toBe('mer. 23 sept. 2026, 17:50')
  })

  it('reads the same for every second of a minute', () => {
    const minute = Date.UTC(2026, 8, 23, 15, 50, 0)
    expect(formatClock(minute + 59_999)).toBe(formatClock(minute))
  })
})

describe('clockDateTime', () => {
  it('drops the seconds, like the displayed clock', () => {
    expect(clockDateTime(Date.UTC(2026, 8, 23, 15, 50, 59, 999))).toBe('2026-09-23T15:50:00.000Z')
  })
})
