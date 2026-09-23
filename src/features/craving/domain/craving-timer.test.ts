import { CRAVING_TIMER_MS, cravingTimer } from './craving-timer'

const SECOND = 1_000
const MINUTE = 60 * SECOND
const STARTED_AT = Date.UTC(2026, 8, 22, 10, 0, 0)

describe('cravingTimer', () => {
  it('lasts four minutes', () => {
    expect(CRAVING_TIMER_MS).toBe(4 * MINUTE)
  })

  it('has the whole duration left the instant it starts', () => {
    expect(cravingTimer(STARTED_AT, STARTED_AT)).toEqual({
      remainingMs: 4 * MINUTE,
      finished: false,
    })
  })

  it('counts down from the start instant, whatever happened in between', () => {
    // The app was backgrounded or reloaded: only the start instant and now matter.
    expect(cravingTimer(STARTED_AT, STARTED_AT + 2 * MINUTE + 15 * SECOND)).toEqual({
      remainingMs: MINUTE + 45 * SECOND,
      finished: false,
    })
  })

  it('finishes exactly when the duration has elapsed', () => {
    expect(cravingTimer(STARTED_AT, STARTED_AT + 4 * MINUTE)).toEqual({
      remainingMs: 0,
      finished: true,
    })
  })

  it('stays finished at zero long after the end', () => {
    expect(cravingTimer(STARTED_AT, STARTED_AT + 3 * 60 * MINUTE)).toEqual({
      remainingMs: 0,
      finished: true,
    })
  })

  it('waits at the full duration while now is still before the start', () => {
    // A sandbox clock moved back past the start.
    expect(cravingTimer(STARTED_AT, STARTED_AT - MINUTE)).toEqual({
      remainingMs: 4 * MINUTE,
      finished: false,
    })
  })
})
