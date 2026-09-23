import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SECOND_MS, splitDuration } from '@/shared/utils/duration'
import { useNow } from './useNow'

/**
 * Real timers fire a few ms late, by an amount that varies from one tick to the next
 * (measured in Chrome: 1–3 ms). A fixed irregular pattern keeps the test deterministic
 * while still varying the lateness of the same tick position from second to second.
 */
const LATENESS_MS = [1, 3, 3, 1, 3, 1, 1, 3]
/** A quit moment whose second boundary sits inside that lateness window, as "now" can produce. */
const QUIT_MOMENT = Date.UTC(2026, 8, 21, 12, 0, 0, 2)

describe('useNow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(QUIT_MOMENT + 86_400_000 + 500)
    const fakeSetTimeout = window.setTimeout.bind(window)
    let call = 0
    vi.spyOn(window, 'setTimeout').mockImplementation((handler: TimerHandler, delay?: number) => {
      const lateness = LATENESS_MS[call++ % LATENESS_MS.length] ?? 0
      return fakeSetTimeout(handler, (delay ?? 0) + lateness)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('never skips a second of the streak when timers fire with jitter', () => {
    const shown: { seconds: number; at: number }[] = []
    const values: number[] = []
    renderHook(() => {
      const now = useNow()
      values.push(now)
      const { seconds } = splitDuration(now - QUIT_MOMENT)
      if (shown.at(-1)?.seconds !== seconds) shown.push({ seconds, at: Date.now() })
    })

    // One tick per act, as the browser renders after each one.
    const end = Date.now() + 30 * SECOND_MS
    while (Date.now() < end) {
      act(() => {
        vi.advanceTimersToNextTimer()
      })
    }

    // No skip: every shown second advances by exactly one from the previous one shown.
    const steps = shown.slice(1).map((s, i) => (s.seconds - (shown[i]?.seconds ?? 0) + 60) % 60)
    expect(steps.filter((step) => step !== 1)).toEqual([])
    expect(shown.length).toBeGreaterThanOrEqual(30)

    // Even cadence: once running, each second is shown roughly 1000ms after the previous one,
    // not in a 0.5s/1.5s pattern (the failure mode of ticking twice a second instead of
    // flooring `now`). The first gap is skipped: mounting lands at an arbitrary point within
    // a second, so the wait until the first tick is naturally a partial second.
    const gaps = shown.slice(2).map((s, i) => s.at - (shown[i + 1]?.at ?? 0))
    expect(gaps.every((gap) => Math.abs(gap - SECOND_MS) <= 5)).toBe(true)

    // `now` always lands on a whole second: the display grid never sees sub-second precision.
    expect(values.every((v) => v % SECOND_MS === 0)).toBe(true)
  })
})
