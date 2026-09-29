import { render, screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { withMotion } from '@/shared/test/motion'
import { COUNT_UP_MS } from '@/shared/utils/count-up'
import { DAY_MS, HOUR_MS, MINUTE_MS, SECOND_MS } from '@/shared/utils/duration'
import { StreakScreen } from './StreakScreen'

/** 12 days, 07:04:09. */
const ELAPSED_MS = 12 * DAY_MS + 7 * HOUR_MS + 4 * MINUTE_MS + 9 * SECOND_MS

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
  expect(shown()).toEqual(['0', '00:00:00'])

  // The clock ticks mid-entrance: the count heads for the new value, it does not restart.
  act(() => vi.advanceTimersByTime(COUNT_UP_MS / 2))
  first.rerender(home(ELAPSED_MS + SECOND_MS))
  const [days, clock] = shown()
  expect(Number(days)).toBeGreaterThan(0)
  expect(clock).not.toBe('00:00:00')

  act(() => vi.advanceTimersByTime(COUNT_UP_MS))
  expect(shown()).toEqual(['12', '07:04:10'])

  // After the entrance, a day rollover shows straight away.
  first.rerender(home(ELAPSED_MS + DAY_MS))
  expect(shown()).toEqual(['13', '07:04:09'])
  first.unmount()

  render(home())
  expect(shown()).toEqual(['12', '07:04:09'])
})
