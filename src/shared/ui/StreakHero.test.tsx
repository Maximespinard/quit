import { render, screen } from '@testing-library/react'
import { StreakHero } from './StreakHero'

const hero = (entrance?: number) => (
  <StreakHero
    duration={{ days: 12, hours: 7, minutes: 4, seconds: 9 }}
    daysLabel="jours de streak"
    regionLabel="Streak"
    brand="quit"
    context="Étape 1 · 21 mg"
    {...(entrance === undefined ? {} : { entrance })}
  />
)

/** The figures as seen: the screen-reader copy always carries the final values. */
const shown = () =>
  [...screen.getByRole('region', { name: 'Streak' }).querySelectorAll('[aria-hidden="true"]')]
    .map((figure) => figure.textContent)
    .filter((text) => text !== '')

it('reads the full day count and pads the clock', () => {
  render(hero(0))

  expect(screen.getByRole('region', { name: 'Streak' })).toHaveTextContent('12')
  expect(screen.getByText('07:04:09', { selector: '.sr-only' })).toBeInTheDocument()
})

it('shows the final values without an entrance', () => {
  render(hero())

  expect(shown()).toEqual(['12', '07:04:09'])
})

it('counts days and clock up together through the entrance', () => {
  const { rerender } = render(hero(0))
  expect(shown()).toEqual(['0', '00:00:00'])

  rerender(hero(0.5))
  expect(shown()).toEqual(['6', '03:02:04'])

  rerender(hero(1))
  expect(shown()).toEqual(['12', '07:04:09'])
})
