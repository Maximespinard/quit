import { DAY_MS, HOUR_MS } from './duration'
import { readSandboxClock, realTimeClock, shiftSandboxClock, stoppedClock } from './sandbox-clock'

const REAL_NOW = Date.UTC(2026, 8, 23, 9, 0, 0)
const STOPPED_AT = Date.UTC(2026, 0, 1, 12, 0, 0)

describe('sandbox clock', () => {
  it('reads real time until it is moved', () => {
    expect(readSandboxClock(realTimeClock, REAL_NOW)).toBe(REAL_NOW)
  })

  it('stays on a fixed instant whatever the real time', () => {
    const clock = stoppedClock(STOPPED_AT)

    expect(readSandboxClock(clock, REAL_NOW)).toBe(STOPPED_AT)
    expect(readSandboxClock(clock, REAL_NOW + HOUR_MS)).toBe(STOPPED_AT)
  })

  it('moves forward and back by an hour and by a day from real time', () => {
    const clock = [DAY_MS, HOUR_MS, -HOUR_MS, DAY_MS].reduce(shiftSandboxClock, realTimeClock)

    expect(readSandboxClock(clock, REAL_NOW)).toBe(REAL_NOW + 2 * DAY_MS)
  })

  it('moves a fixed instant without letting it run', () => {
    const clock = shiftSandboxClock(stoppedClock(STOPPED_AT), -DAY_MS)

    expect(readSandboxClock(clock, REAL_NOW)).toBe(STOPPED_AT - DAY_MS)
    expect(readSandboxClock(clock, REAL_NOW + HOUR_MS)).toBe(STOPPED_AT - DAY_MS)
  })
})
