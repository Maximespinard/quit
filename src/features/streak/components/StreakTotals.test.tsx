import { render, screen } from '@testing-library/react'
import { derive } from '@/shared/domain/derive'
import { scenarioById } from '@/shared/domain/scenarios'
import { strings } from '@/shared/utils/strings'
import { StreakTotals } from './StreakTotals'

const HOUR = 3_600_000

/** Facts in, card out: the props come from the derived state of a scenario's journal. */
function renderFor(id: Parameters<typeof scenarioById>[0]) {
  const { journal, now } = scenarioById(id)
  const derived = derive(journal, now)
  if (derived.smokeFreeDays === null) throw new Error(`scenario ${id} has no quit moment`)
  return render(
    <StreakTotals
      smokeFreeDays={derived.smokeFreeDays}
      personalBest={derived.personalBest}
      lastCigarette={derived.lastCigarette}
    />,
  )
}

it('is absent while no lapse exists', () => {
  const { container } = renderFor('day-29')

  expect(container).toBeEmptyDOMElement()
})

it('shows the smoke-free days after a slip, without the personal best', () => {
  renderFor('day-45-lapse')

  expect(screen.getByRole('region', { name: strings.streak.totals })).toBeVisible()
  expect(screen.getByText(strings.streak.smokeFreeDays)).toBeVisible()
  expect(screen.queryByText(strings.streak.personalBest)).toBeNull()
})

it('adds the personal best once a relapse exists', () => {
  render(
    <StreakTotals
      smokeFreeDays={4}
      personalBest={{ elapsedMs: 7 * 24 * HOUR }}
      lastCigarette={null}
    />,
  )

  expect(screen.getByText(strings.streak.smokeFreeDays)).toBeVisible()
  expect(screen.getByText(strings.streak.personalBest)).toBeVisible()
})
