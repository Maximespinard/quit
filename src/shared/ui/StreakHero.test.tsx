import { render, screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ENTRANCE_MS } from '@/shared/hooks/useLaunchEntrance'
import { StreakHero } from './StreakHero'

const DURATION = { days: 12, hours: 7, minutes: 4, seconds: 9 }

const hero = (duration = DURATION) => (
  <StreakHero
    duration={duration}
    daysLabel="jours de streak"
    regionLabel="Streak"
    brand="quit"
    context="Étape 1 · 21 mg"
  />
)

/** The figures as seen: the screen-reader copy always carries the final values. */
const shown = () =>
  [...screen.getByRole('region', { name: 'Streak' }).querySelectorAll('[aria-hidden="true"]')]
    .map((figure) => figure.textContent)
    .filter((text) => text !== '')

it('reads the full day count and pads the clock', () => {
  render(hero())

  expect(screen.getByRole('region', { name: 'Streak' })).toHaveTextContent('12')
  expect(screen.getByText('07:04:09', { selector: '.sr-only' })).toBeInTheDocument()
})

it('shows the final values from the first paint under reduced motion', () => {
  render(hero())

  expect(shown()).toEqual(['12', '07:04:09'])
})

describe('with motion', () => {
  const reducedMotion = window.matchMedia

  afterEach(() => {
    window.matchMedia = reducedMotion
    vi.useRealTimers()
  })

  beforeEach(() => {
    vi.useFakeTimers()
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  })

  // One test: the entrance is spent for the whole file once the hero has mounted.
  it('counts days and clock up on the first mount of the launch only, then follows the clock', () => {
    const first = render(hero())
    expect(shown()).toEqual(['0', '00:00:00'])

    // The clock ticks mid-entrance: the count heads for the new value, it does not restart.
    act(() => vi.advanceTimersByTime(ENTRANCE_MS / 2))
    first.rerender(hero({ ...DURATION, seconds: 10 }))
    const [days, clock] = shown()
    expect(Number(days)).toBeGreaterThan(0)
    expect(clock).not.toBe('00:00:00')

    act(() => vi.advanceTimersByTime(ENTRANCE_MS))
    expect(shown()).toEqual(['12', '07:04:10'])

    // After the entrance, a new value shows straight away.
    first.rerender(hero({ ...DURATION, days: 13, seconds: 11 }))
    expect(shown()).toEqual(['13', '07:04:11'])
    first.unmount()

    render(hero())
    expect(shown()).toEqual(['12', '07:04:09'])
  })
})
