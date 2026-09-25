import { render, screen } from '@testing-library/react'
import { strings } from '@/shared/utils/strings'
import { SlipNote } from './SlipNote'

const HOUR = 3_600_000
const copy = strings.lapse

it('says nothing without a slip', () => {
  const { container } = render(<SlipNote lastCigarette={null} lapseDaysInARow={0} />)

  expect(container).toBeEmptyDOMElement()
})

it('says how long since the last cigarette, to the minute within a day', () => {
  render(<SlipNote lastCigarette={{ elapsedMs: 3 * HOUR + 12 * 60_000 }} lapseDaysInARow={0} />)

  expect(screen.getByText('Dernière cigarette il y a 3 h 12 min.')).toBeVisible()
})

it('says it to the hour past a day', () => {
  render(<SlipNote lastCigarette={{ elapsedMs: 50 * HOUR }} lapseDaysInARow={0} />)

  expect(screen.getByText('Dernière cigarette il y a 2 j 2 h.')).toBeVisible()
})

it('says it in minutes within the hour, and right after', () => {
  const { rerender } = render(<SlipNote lastCigarette={{ elapsedMs: 0 }} lapseDaysInARow={1} />)

  expect(screen.getByText('Dernière cigarette il y a moins d’une minute.')).toBeVisible()

  rerender(<SlipNote lastCigarette={{ elapsedMs: 25 * 60_000 }} lapseDaysInARow={1} />)

  expect(screen.getByText('Dernière cigarette il y a 25 min.')).toBeVisible()
})

it.each([1, 2])('names the threshold after %s lapse day(s) in a row', (days) => {
  render(<SlipNote lastCigarette={{ elapsedMs: HOUR }} lapseDaysInARow={days} />)

  expect(screen.getByText(copy.lapseDays(days))).toBeVisible()
})

it('leaves the threshold out once the run is broken', () => {
  render(<SlipNote lastCigarette={{ elapsedMs: 80 * HOUR }} lapseDaysInARow={0} />)

  expect(screen.queryByText(copy.lapseDays(1))).toBeNull()
})
