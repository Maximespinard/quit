import { render, screen } from '@testing-library/react'
import { derive } from '@/shared/domain/derive'
import type { Journal } from '@/shared/domain/journal'
import { scenarioById } from '@/shared/domain/scenarios'
import { journalWithLapses } from '@/shared/test/journals'
import { strings } from '@/shared/utils/strings'
import { StreakTotals } from './StreakTotals'

const HOUR = 3_600_000

/** Facts in, card out: the props come from the derived state of a scenario's journal. */
function renderJournal(journal: Journal, now: number) {
  const derived = derive(journal, now)
  if (derived.smokeFreeDays === null) throw new Error(`journal has no quit moment`)
  return render(
    <StreakTotals
      smokeFreeDays={derived.smokeFreeDays}
      personalBest={derived.personalBest}
      lastCigarette={derived.lastCigarette}
    />,
  )
}

const renderFor = (id: Parameters<typeof scenarioById>[0]) => {
  const { journal, now } = scenarioById(id)
  return renderJournal(journal, now)
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

it('adds the personal best once a relapse exists, with no slip open', () => {
  const quitMoment = Date.UTC(2026, 0, 1, 9)
  const day = 24 * HOUR
  // Lapses on three days in a row: a relapse, so the streak says it and no slip is left.
  const journal = journalWithLapses(quitMoment, [
    quitMoment + 2 * day,
    quitMoment + 3 * day,
    quitMoment + 4 * day,
  ])
  renderJournal(journal, quitMoment + 4 * day + HOUR)

  expect(screen.getByRole('region', { name: strings.streak.totals })).toBeVisible()
  expect(screen.getByText(strings.streak.smokeFreeDays)).toBeVisible()
  expect(screen.getByText(strings.streak.personalBest)).toBeVisible()
})
