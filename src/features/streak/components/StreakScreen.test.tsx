import { render, screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { withMotion } from '@/shared/test/motion'
import { COUNT_UP_MS } from '@/shared/utils/count-up'
import { DAY_MS, HOUR_MS, MINUTE_MS, SECOND_MS } from '@/shared/utils/duration'
import { StreakScreen } from './StreakScreen'

/** 12 days, 07 h 04 and 9 seconds. */
const ELAPSED_MS = 12 * DAY_MS + 7 * HOUR_MS + 4 * MINUTE_MS + 9 * SECOND_MS

/** The hours and minutes past the days, as the hero shows them: `07 h 04`. */
const clock = (hours: number, minutes: number) =>
  `${String(hours).padStart(2, '0')}\u00a0h\u00a0${String(minutes).padStart(2, '0')}`

const home = (elapsedMs = ELAPSED_MS) => <StreakScreen streak={{ elapsedMs }} brand="quit" />

/** The figures as seen: the screen-reader copy always carries the final values. */
const shown = () =>
  [...screen.getByRole('region', { name: 'Streak' }).querySelectorAll('[aria-hidden="true"]')]
    .map((figure) => figure.textContent)
    .filter((text) => text !== '')

const reducedMotion = window.matchMedia

beforeEach(() => {
  vi.useFakeTimers()
  withMotion()
})

afterEach(() => {
  window.matchMedia = reducedMotion
  vi.useRealTimers()
})

// One test: the launch entrance is spent for the whole file once home has mounted.
it('counts up on the first mount of the launch only, then follows the clock', () => {
  const first = render(home())
  expect(shown()).toEqual(['0', clock(0, 0)])

  // The clock ticks mid-entrance: the count heads for the new value, it does not restart.
  act(() => vi.advanceTimersByTime(COUNT_UP_MS / 2))
  first.rerender(home(ELAPSED_MS + MINUTE_MS))
  const [days, midway] = shown()
  expect(Number(days)).toBeGreaterThan(0)
  expect(midway).not.toBe(clock(0, 0))

  act(() => vi.advanceTimersByTime(COUNT_UP_MS))
  expect(shown()).toEqual(['12', clock(7, 5)])

  // After the entrance, a day rollover shows straight away.
  first.rerender(home(ELAPSED_MS + DAY_MS))
  expect(shown()).toEqual(['13', clock(7, 4)])
  first.unmount()

  render(home())
  expect(shown()).toEqual(['12', clock(7, 4)])
})
